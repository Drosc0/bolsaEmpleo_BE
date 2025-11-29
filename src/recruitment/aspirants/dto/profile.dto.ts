import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  ValidateNested,
  IsInt,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types'; // Necesario para crear DTOs opcionales

// --- 1. DTOs Anidados (Experiencia y Habilidades) ---

export class SkillItemDto {
  @IsOptional()
  id?: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number) // Asegura que el valor sea tratado como número entero
  level?: number;
}

export class ExperienceItemDto {
  @IsOptional()
  id?: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  company: string;

  // Se asume el formato ISO 8601 (string) para la fecha
  @IsNotEmpty()
  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

// 2. DTO Principal de Creación (Obligatorio)

export class CreateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  portfolioUrl?: string;

  @IsOptional()
  @IsString()
  currentJobTitle?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  cvUrl?: string;

  // Listas anidadas
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillItemDto)
  skills?: SkillItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceItemDto)
  experience?: ExperienceItemDto[];
}

// 3. DTO Principal de Actualización (Opcional)

/**
 * Hereda de CreateProfileDto, haciendo TODAS sus propiedades opcionales.
 * Esto resuelve los errores de sobreescritura y tipado 'string | undefined'.
 */
export class UpdateProfileDto extends PartialType(CreateProfileDto) {}
