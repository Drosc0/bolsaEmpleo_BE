import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ExperienceItem } from '../entities/experience-item.entity';
import { ProfileService } from './profile.service';
import {
  CreateExperienceItemDto,
  UpdateExperienceItemDto,
} from '../dto/experience-item.dto';

@Injectable()
export class ExperienceItemService {
  constructor(
    @InjectRepository(ExperienceItem)
    private experienceRepository: Repository<ExperienceItem>,
    private profileService: ProfileService,
  ) {}

  // MÉTODO AÑADIDO
 
  /**
   * Encuentra todos los registros de experiencia laboral para un usuario dado.
   */
  async findAllByAspirant(userId: number): Promise<ExperienceItem[]> {
    const profile = await this.profileService.findByUserId(userId);
    if (!profile) {
      // Si no hay perfil base, no hay experiencia que buscar.
      return [];
    }

    try {
      // Buscamos todas las experiencias que tengan el ID del perfil asociado
      return await this.experienceRepository.find({
        where: { profileId: profile.id },
        order: { startDate: 'DESC' }, // Opcional: ordenar por fecha de inicio
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(
          'Error al buscar experiencias por aspirante:',
          error.message,
        );
      }
      throw new InternalServerErrorException(
        'Error al obtener la lista de experiencias.',
      );
    }
  }

  // MÉTODOS EXISTENTES (create, update, remove)
  
  /**
   * Crea un ítem de experiencia laboral para el perfil del usuario.
   */
  async create(
    userId: number,
    dto: CreateExperienceItemDto,
  ): Promise<ExperienceItem> {
    const profile = await this.profileService.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Perfil de aspirante no encontrado.');
    }

    try {
      const newExperience = this.experienceRepository.create({
        ...dto,
        profileId: profile.id,
      });

      return this.experienceRepository.save(newExperience);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(
          'Error al guardar la experiencia laboral:',
          error.message,
        );
      }
      throw new InternalServerErrorException(
        'Error al guardar la experiencia laboral.',
      );
    }
  }

  /**
   * Actualiza un ítem de experiencia laboral específico.
   */
  async update(
    userId: number,
    experienceId: number,
    dto: UpdateExperienceItemDto,
  ): Promise<ExperienceItem> {
    const experience = await this.experienceRepository.findOne({
      where: { id: experienceId },
      relations: ['profile'],
    });

    if (!experience) {
      throw new NotFoundException('Experiencia laboral no encontrada.');
    }

    if (experience.profile.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para modificar esta experiencia.',
      );
    }

    this.experienceRepository.merge(experience, dto);

    try {
      return this.experienceRepository.save(experience);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(
          'Error al actualizar la experiencia laboral:',
          error.message,
        );
      }
      throw new InternalServerErrorException(
        'Error al actualizar la experiencia laboral.',
      );
    }
  }

  /**
   * Elimina un ítem de experiencia laboral.
   */
  async remove(userId: number, experienceId: number): Promise<void> {
    const experience = await this.experienceRepository.findOne({
      where: { id: experienceId },
      relations: ['profile'],
    });

    if (!experience) {
      throw new NotFoundException('Experiencia laboral no encontrada.');
    }

    if (experience.profile.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta experiencia.',
      );
    }

    try {
      await this.experienceRepository.delete(experienceId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(
          'Error al eliminar la experiencia laboral:',
          error.message,
        );
      }
      throw new InternalServerErrorException(
        'Error al eliminar la experiencia laboral.',
      );
    }
  }
}
