import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

// DTO para crear el perfil inicial de la empresa
export class CreateCompanyProfileDto {
  @IsNotEmpty()
  @IsString()
  name: string; 

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  websiteUrl?: string; 

  @IsOptional()
  @IsString()
  address?: string;
}

// DTO para actualizar el perfil
export class UpdateCompanyProfileDto extends PartialType(
  CreateCompanyProfileDto,
) {
  // Hereda todos los campos como opcionales
}
