import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItem } from './entities/wishlist-item.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(WishlistItem)
    private readonly wishlistRepo: Repository<WishlistItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async findByUser(userId: string): Promise<WishlistItem[]> {
    return this.wishlistRepo.find({
      where: { userId },
      relations: ['product', 'product.images', 'product.category'],
      order: { createdAt: 'DESC' },
    });
  }

  async add(userId: string, productId: string): Promise<WishlistItem> {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.wishlistRepo.findOne({
      where: { userId, productId },
    });
    if (existing) throw new ConflictException('Product already in wishlist');

    const item = this.wishlistRepo.create({ userId, productId });
    return this.wishlistRepo.save(item);
  }

  async remove(userId: string, productId: string): Promise<void> {
    const result = await this.wishlistRepo.delete({ userId, productId });
    if (result.affected === 0) throw new NotFoundException('Item not found');
  }

  async isFavorite(userId: string, productId: string): Promise<boolean> {
    const count = await this.wishlistRepo.count({ where: { userId, productId } });
    return count > 0;
  }
}
