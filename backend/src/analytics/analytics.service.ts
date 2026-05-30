import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async getDashboardMetrics() {
    const [totalOrders, totalUsers, totalProducts, totalRevenue] = await Promise.all([
      this.orderRepo.count(),
      this.userRepo.count(),
      this.productRepo.count(),
      this.orderRepo
        .createQueryBuilder('order')
        .select('COALESCE(SUM(order.totalAmount), 0)', 'total')
        .where("order.status = 'paid'")
        .getRawOne(),
    ]);

    const recentOrders = await this.orderRepo.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue: parseFloat(totalRevenue?.total || '0'),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        customerName: o.customerName,
        totalAmount: o.totalAmount,
        status: o.status,
        createdAt: o.createdAt,
      })),
    };
  }
}
