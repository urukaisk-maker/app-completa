import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { AddressController } from './address.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Address])],
  controllers: [AddressController],
  exports: [TypeOrmModule],
})
export class UsersModule {}
