import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

const storage = diskStorage({
  destination: './uploads/products',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
  },
});

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Public()
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sortBy') sortBy?: 'price' | 'name' | 'createdAt',
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.service.findAllWithFilters({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      categoryId,
      search,
      minPrice: minPrice !== undefined ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice !== undefined ? parseFloat(maxPrice) : undefined,
      sortBy,
      sortOrder,
    });
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  @Post(':id/images')
  @UseInterceptors(
    FileInterceptor('image', {
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('order') order?: string,
  ) {
    const url = `/uploads/products/${file.filename}`;
    return this.service.addImage(id, url, order ? parseInt(order, 10) : 0);
  }

  @Delete('images/:imageId')
  removeImage(@Param('imageId', ParseUUIDPipe) imageId: string) {
    return this.service.removeImage(imageId);
  }

  @Post(':id/variants')
  addVariant(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: any,
  ) {
    return this.service.addVariant(id, dto);
  }

  @Patch('variants/:variantId')
  updateVariant(
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() dto: any,
  ) {
    return this.service.updateVariant(variantId, dto);
  }

  @Delete('variants/:variantId')
  removeVariant(@Param('variantId', ParseUUIDPipe) variantId: string) {
    return this.service.removeVariant(variantId);
  }
}
