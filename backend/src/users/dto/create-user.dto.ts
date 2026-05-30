import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'Manuel', description: 'Nombre del usuario' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  firstName: string;

  @ApiProperty({ example: 'Carrasco', description: 'Apellidos del usuario' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  lastName: string;

  @ApiProperty({ example: 'urukaisk@gmail.com', description: 'Email único' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '622311428', description: 'Teléfono' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiProperty({ example: 'password123', description: 'Contraseña (min 6)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(255)
  password: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.USER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
