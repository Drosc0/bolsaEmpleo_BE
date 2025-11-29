import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

// DTO para crear el perfil inicial de la empresa
export class CreateCompanyProfileDto {
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;
}

// DTO para actualizar el perfil
export class UpdateCompanyProfileDto extends PartialType(
  CreateCompanyProfileDto,
) {
  // Hereda todos los campos como opcionales
}
