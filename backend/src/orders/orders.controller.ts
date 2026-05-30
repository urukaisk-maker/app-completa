import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Headers,
  Req,
  RawBody,
} from '@nestjs/common';
import { Request } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post('checkout')
  async checkout(@Body() dto: CreateOrderDto, @Req() req: Request) {
    const user = (req as any).user;
    const userId = user?.sub;
    return this.service.createOrder(dto, userId);
  }

  @Post('webhook')
  async webhook(
    @Headers('stripe-signature') signature: string,
    @RawBody() payload: Buffer,
  ) {
    await this.service.handleWebhook(signature, payload);
    return { received: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }
}
