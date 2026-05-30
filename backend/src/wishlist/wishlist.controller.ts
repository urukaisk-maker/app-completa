import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WishlistService } from './wishlist.service';

@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly service: WishlistService) {}

  @Get()
  findAll(@Req() req: Request) {
    const user = (req as any).user;
    return this.service.findByUser(user.id);
  }

  @Post(':productId')
  @HttpCode(HttpStatus.CREATED)
  add(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.service.add(user.id, productId);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.service.remove(user.id, productId);
  }

  @Get('check/:productId')
  check(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.service.isFavorite(user.id, productId);
  }
}
