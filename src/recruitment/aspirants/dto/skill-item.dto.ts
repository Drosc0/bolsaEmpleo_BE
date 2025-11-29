import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

// La definición base de la habilidad 
export class BaseSkillItemDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  level?: number;
}

// DTO para Crear una Habilidad (todos los campos son obligatorios)
export class CreateSkillItemDto extends BaseSkillItemDto { }

// DTO para Actualizar una Habilidad (todos los campos son opcionales)
export class UpdateSkillItemDto extends PartialType(BaseSkillItemDto) {
  // Nota: PartialType hace que 'name', 'category', y 'level' sean opcionales.
}
