import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';

import { AspirantProfile } from '../entities/aspirant-profile.entity';
import { ExperienceItem } from '../entities/experience-item.entity';
import { SkillItem, SkillLevel } from '../entities/skill-item.entity';
import {
  CreateProfileDto,
  UpdateProfileDto,
  SkillItemDto,
} from '../dto/profile.dto';
import { User } from '../../../user/user.entity';

// --- Función Auxiliar para mapear el nivel numérico a Enum/String ---
const mapLevelToSkillLevel = (level: number): SkillLevel => {
  if (level >= 5) return SkillLevel.EXPERT;
  if (level >= 4) return SkillLevel.ADVANCED;
  if (level >= 3) return SkillLevel.INTERMEDIATE;
  if (level >= 2) return SkillLevel.BASIC;
  return SkillLevel.NOVICE;
};

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(AspirantProfile)
    private profileRepository: Repository<AspirantProfile>,
    @InjectRepository(ExperienceItem)
    private experienceRepository: Repository<ExperienceItem>,
    @InjectRepository(SkillItem)
    private skillRepository: Repository<SkillItem>,
  ) { }

  /**
   * Crea un perfil vacío usando solo el objeto User.
   * Esto satisface la restricción OneToOne inmediatamente después del registro.
   */
  async createDefault(user: User): Promise<AspirantProfile> {
    try {
      // Creamos la entrada de perfil solo con la FK y datos por defecto (si los hay)
      const newProfile = this.profileRepository.create({
        userId: user.id,
        email: user.email,
      });

      return await this.profileRepository.save(newProfile);
    } catch (error) {
      console.error(
        'Error al crear el perfil de aspirante por defecto:',
        error,
      );
      throw new InternalServerErrorException(
        'Fallo al inicializar el perfil del aspirante.',
      );
    }
  }

  /**
   * Busca un perfil de aspirante por el ID del usuario, cargando el CV.
   */
  async findByUserId(userId: number): Promise<AspirantProfile | null> {
    try {
      return await this.profileRepository.findOne({
        where: { userId },
        relations: ['experience', 'skills'],
      });
    } catch (error) {
      console.error('Error al buscar el perfil del aspirante:', error);
      throw new InternalServerErrorException(
        'Error al buscar el perfil del aspirante.',
      );
    }
  }

  /**
   * Crea un nuevo perfil de aspirante, incluyendo colecciones anidadas.
   */
  async create(
    userId: number,
    createProfileDto: CreateProfileDto,
  ): Promise<AspirantProfile> {
    const existingProfile = await this.profileRepository.findOneBy({ userId });
    if (existingProfile) {
      throw new BadRequestException(
        'Este usuario ya tiene un perfil de aspirante creado.',
      );
    }

    // 1. Separar datos base de colecciones
    const { skills, experience, ...profileBaseData } = createProfileDto;

    const newProfileData: DeepPartial<AspirantProfile> = {
      ...profileBaseData,
      userId,
    };

    const newProfile = this.profileRepository.create(newProfileData);

    try {
      // 2. Crear y asignar las entidades de relación
      if (skills) {
        newProfile.skills = skills.map((sDto: SkillItemDto) => {
          const skillEntityData = {
            skillName: sDto.name, // Mapeo de nombre
            level: mapLevelToSkillLevel(sDto.level ?? 2), // Mapeo de nivel (default 2=BASIC)
          };
          return this.skillRepository.create({
            ...skillEntityData,
            profile: newProfile,
          });
        });
      }
      if (experience) {
        newProfile.experience = experience.map((eDto) =>
          this.experienceRepository.create({
            ...eDto,
            profile: newProfile,
          }),
        );
      }

      await this.profileRepository.save(newProfile);
      return (await this.findByUserId(userId)) as AspirantProfile;
    } catch (error) {
      console.error('Error al guardar el nuevo perfil de aspirante:', error);
      throw new InternalServerErrorException(
        'Error al guardar el nuevo perfil de aspirante.',
      );
    }
  }

  /**
   * Actualiza el perfil existente de un usuario.
   */
  async updateByUserId(
    userId: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<AspirantProfile> {
    const profileToUpdate = await this.profileRepository.findOneBy({ userId });

    if (!profileToUpdate) {
      throw new NotFoundException(
        'Perfil de aspirante no encontrado para actualización.',
      );
    }

    try {
      // 1. Separar colecciones anidadas para evitar error de tipado en merge
      const { skills, experience, ...profileBaseData } = updateProfileDto;
      this.profileRepository.merge(profileToUpdate, profileBaseData);

      // 2. Manejo de colecciones: Borrar y recrear
      if (skills) {
        await this.skillRepository.delete({ profile: profileToUpdate });

        profileToUpdate.skills = skills.map((s: SkillItemDto) => {
          const skillEntityData = {
            skillName: s.name,
            level: mapLevelToSkillLevel(s.level ?? 2),
          };
          return this.skillRepository.create({
            ...skillEntityData,
            profileId: profileToUpdate.id,
          });
        });
      }
      if (experience) {
        await this.experienceRepository.delete({
          profile: profileToUpdate,
        });
        profileToUpdate.experience = experience.map((e) =>
          this.experienceRepository.create({
            ...e,
            profileId: profileToUpdate.id,
          }),
        );
      }
      await this.profileRepository.save(profileToUpdate);
      return (await this.findByUserId(userId)) as AspirantProfile;
    } catch (error) {
      console.error('Error al actualizar el perfil del aspirante:', error);
      throw new InternalServerErrorException(
        'Error al actualizar el perfil del aspirante.',
      );
    }
  }

  /**
   * Elimina el perfil de aspirante del usuario.
   */
  async deleteProfile(
    userId: number,
  ): Promise<{ success: boolean; message: string }> {
    const profileToDelete = await this.profileRepository.findOneBy({ userId });

    if (!profileToDelete) {
      return { success: false, message: 'Perfil no encontrado.' };
    }

    try {
      await this.profileRepository.delete(profileToDelete.id);
      return {
        success: true,
        message: 'Perfil de aspirante eliminado exitosamente.',
      };
    } catch (error) {
      console.error('Error al eliminar perfil:', error);
      return {
        success: false,
        message: 'Error interno al eliminar el perfil.',
      };
    }
  }
}
