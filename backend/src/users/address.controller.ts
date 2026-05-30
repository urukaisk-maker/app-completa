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
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';

@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressController {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) {}

  @Get()
  async findAll(@Req() req: Request) {
    const user = (req as any).user;
    return this.addressRepo.find({
      where: { userId: user.id },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  @Post()
  async create(@Body() dto: CreateAddressDto, @Req() req: Request) {
    const user = (req as any).user;

    if (dto.isDefault) {
      await this.addressRepo.update(
        { userId: user.id },
        { isDefault: false },
      );
    }

    const address = this.addressRepo.create({
      ...dto,
      userId: user.id,
    });

    return this.addressRepo.save(address);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateAddressDto>,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    const address = await this.addressRepo.findOne({ where: { id } });

    if (!address || address.userId !== user.id) {
      throw new ForbiddenException();
    }

    if (dto.isDefault) {
      await this.addressRepo.update(
        { userId: user.id },
        { isDefault: false },
      );
    }

    await this.addressRepo.update(id, dto);
    return this.addressRepo.findOne({ where: { id } });
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const user = (req as any).user;
    const address = await this.addressRepo.findOne({ where: { id } });

    if (!address || address.userId !== user.id) {
      throw new ForbiddenException();
    }

    await this.addressRepo.delete(id);
    return { deleted: true };
  }
}
