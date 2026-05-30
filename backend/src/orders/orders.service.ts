import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  private stripe: any;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly itemRepo: Repository<OrderItem>,
    private readonly configService: ConfigService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    this.stripe = new (Stripe as any)(secretKey, { apiVersion: '2026-05-27.dahlia' });
  }

  async createOrder(dto: CreateOrderDto, userId?: string): Promise<{ order: Order; clientSecret: string }> {
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    const order = this.orderRepo.create({
      customerEmail: dto.customerEmail,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      shippingAddress: dto.shippingAddress,
      totalAmount,
      status: OrderStatus.PENDING,
      userId: userId || null,
    });

    order.items = dto.items.map((item) =>
      this.itemRepo.create({
        productId: item.productId,
        productName: item.productName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        totalPrice: item.unitPrice * item.quantity,
      }),
    );

    const savedOrder = await this.orderRepo.save(order);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // cents
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: savedOrder.id,
        customerEmail: dto.customerEmail,
      },
    });

    savedOrder.stripePaymentIntentId = paymentIntent.id;
    await this.orderRepo.save(savedOrder);

    return {
      order: savedOrder,
      clientSecret: paymentIntent.client_secret!,
    };
  }

  async handleWebhook(signature: string, payload: Buffer): Promise<void> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as any;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        await this.orderRepo.update(
          { id: orderId },
          { status: OrderStatus.PAID },
        );
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as any;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        await this.orderRepo.update(
          { id: orderId },
          { status: OrderStatus.CANCELLED },
        );
      }
    }
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepo.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
