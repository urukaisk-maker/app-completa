import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

export interface FindProductsFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imageRepo: Repository<ProductImage>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const { images, variants, ...rest } = dto;
    const product = this.productRepo.create(rest);

    if (images && images.length > 0) {
      product.images = images.map((img) => this.imageRepo.create(img));
    }

    if (variants && variants.length > 0) {
      product.variants = variants.map((v) => this.variantRepo.create(v));
    }

    return this.productRepo.save(product);
  }

  async findAllWithFilters(filters: FindProductsFilters): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 20,
      categoryId,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filters;

    const where: any = { isActive: true };

    if (categoryId) {
      where.category = { id: categoryId };
    }

    if (search) {
      where.name = Like(`%${search}%`);
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      where.price = Between(minPrice, maxPrice);
    } else if (minPrice !== undefined) {
      where.price = Between(minPrice, 99999999);
    } else if (maxPrice !== undefined) {
      where.price = Between(0, maxPrice);
    }

    const [data, total] = await this.productRepo.findAndCount({
      where,
      relations: ['category', 'images', 'variants'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id, isActive: true },
      relations: ['category', 'images', 'variants'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    const { images, variants, ...rest } = dto;

    Object.assign(product, rest);

    if (images) {
      product.images = images.map((img) => this.imageRepo.create(img));
    }

    if (variants) {
      product.variants = variants.map((v) => this.variantRepo.create(v));
    }

    return this.productRepo.save(product);
  }

  async remove(id: string): Promise<void> {
    const result = await this.productRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Product not found');
  }

  async addImage(productId: string, url: string, order = 0): Promise<ProductImage> {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const image = this.imageRepo.create({ url, order, product });
    return this.imageRepo.save(image);
  }

  async removeImage(imageId: string): Promise<void> {
    const result = await this.imageRepo.delete(imageId);
    if (result.affected === 0) throw new NotFoundException('Image not found');
  }

  async addVariant(productId: string, dto: any): Promise<ProductVariant> {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    const variant = this.variantRepo.create({ ...dto, productId });
    return this.variantRepo.save(variant);
  }

  async updateVariant(variantId: string, dto: any): Promise<ProductVariant> {
    const variant = await this.variantRepo.findOne({ where: { id: variantId } });
    if (!variant) throw new NotFoundException('Variant not found');
    Object.assign(variant, dto);
    return this.variantRepo.save(variant);
  }

  async removeVariant(variantId: string): Promise<void> {
    const result = await this.variantRepo.delete(variantId);
    if (result.affected === 0) throw new NotFoundException('Variant not found');
  }
}
