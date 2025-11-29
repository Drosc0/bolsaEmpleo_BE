import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SkillItem, SkillLevel } from '../entities/skill-item.entity';
import { ProfileService } from './profile.service';
import { CreateSkillItemDto, UpdateSkillItemDto } from '../dto/skill-item.dto'; // Asumimos estos DTOs

@Injectable()
export class SkillItemService {
  constructor(
    @InjectRepository(SkillItem)
    private skillRepository: Repository<SkillItem>,
    private profileService: ProfileService,
  ) { }

  /**
   * Mapeo de nivel numérico (DTO) a nivel Enum (Entidad)
   */
  private mapLevelToSkillLevel(level: number): SkillLevel {
    if (level >= 5) return SkillLevel.EXPERT;
    if (level >= 4) return SkillLevel.ADVANCED;
    if (level >= 3) return SkillLevel.INTERMEDIATE;
    if (level >= 2) return SkillLevel.BASIC;
    return SkillLevel.NOVICE;
  }

  /**
   * Crea un ítem de habilidad para el perfil del usuario.
   */
  async create(userId: number, dto: CreateSkillItemDto): Promise<SkillItem> {
    const profile = await this.profileService.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Perfil de aspirante no encontrado.');
    }

    try {
      const newSkill = this.skillRepository.create({
        skillName: dto.name, // Mapeo de DTO.name a Entity.skillName
        level: this.mapLevelToSkillLevel(dto.level ?? 2), // Mapeo de nivel (default 2=BASIC)
        profileId: profile.id,
      });

      return this.skillRepository.save(newSkill);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error al guardar la habilidad:', error.message);
      }
      throw new InternalServerErrorException('Error al guardar la habilidad.');
    }
  }

  /**
   * Actualiza un ítem de habilidad específico.
   */
  async update(
    userId: number,
    skillId: number,
    dto: UpdateSkillItemDto,
  ): Promise<SkillItem> {
    const skill = await this.skillRepository.findOne({
      where: { id: skillId },
      relations: ['profile'],
    });

    if (!skill) {
      throw new NotFoundException('Habilidad no encontrada.');
    }

    // Asegura que la habilidad pertenece al usuario autenticado
    if (skill.profile.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para modificar esta habilidad.',
      );
    }

    // Mapeo y fusión de datos
    const updatedData: Partial<SkillItem> = {};
    if (dto.name) updatedData.skillName = dto.name;
    if (dto.level) updatedData.level = this.mapLevelToSkillLevel(dto.level);

    this.skillRepository.merge(skill, updatedData);

    try {
      return this.skillRepository.save(skill);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error al actualizar la habilidad:', error.message);
      }
      throw new InternalServerErrorException(
        'Error al actualizar la habilidad.',
      );
    }
  }

  /**
   * Elimina un ítem de habilidad.
   */
  async remove(userId: number, skillId: number): Promise<void> {
    const skill = await this.skillRepository.findOne({
      where: { id: skillId },
      relations: ['profile'],
    });

    if (!skill) {
      throw new NotFoundException('Habilidad no encontrada.');
    }

    if (skill.profile.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta habilidad.',
      );
    }

    await this.skillRepository.delete(skillId);
  }
}
