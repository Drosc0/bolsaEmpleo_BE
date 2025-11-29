import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

// DTO para crear una nueva entrada de experiencia
export class CreateExperienceItemDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  company: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

// DTO para actualizar la experiencia (todos los campos son opcionales)
export class UpdateExperienceItemDto extends PartialType(
  CreateExperienceItemDto,
) {
  // Hereda y hace opcionales todos los campos de Create
}
