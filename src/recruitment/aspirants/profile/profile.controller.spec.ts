import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';

import { ProfileService } from './profile.service';
import { CreateProfileDto, UpdateProfileDto } from '../dto/profile.dto';
import { AspirantProfile } from '../entities/aspirant-profile.entity';

// Autenticación y Roles
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/user.entity';

// Interfaz para tipar el objeto de solicitud con el usuario adjunto
interface CustomRequest extends Request {
  user: {
    id: number; // ID del usuario autenticado
    role: UserRole;
  };
}

@Controller('recruitment/aspirants/profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ASPIRANTE) // Solo los aspirantes pueden gestionar su perfil
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // 1. CREACIÓN DEL PERFIL BASE
  
  /**
   * POST /api/recruitment/aspirants/profile
   * Crea el perfil base del aspirante.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: CustomRequest,
    @Body() createProfileDto: CreateProfileDto,
  ): Promise<AspirantProfile> {
    const userId = req.user.id;
    return this.profileService.create(userId, createProfileDto);
  }

  // 2. LECTURA DEL PERFIL COMPLETO (CV)
 
  /**
   * GET /api/recruitment/aspirants/profile
   * Obtiene el perfil completo (incluyendo habilidades y experiencia) del aspirante autenticado.
   */
  @Get()
  async findOne(@Req() req: CustomRequest): Promise<AspirantProfile> {
    const userId = req.user.id;
    const profile = await this.profileService.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException(
        'Perfil de aspirante no encontrado. Considere crearlo.',
      );
    }
    return profile;
  }

  // 3. ACTUALIZACIÓN Y ELIMINACIÓN
 
  /**
   * PUT /api/recruitment/aspirants/profile
   * Actualiza los campos del perfil base y las colecciones anidadas.
   */
  @Put()
  async update(
    @Req() req: CustomRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<AspirantProfile> {
    const userId = req.user.id;
    return this.profileService.updateByUserId(userId, updateProfileDto);
  }

  /**
   * DELETE /api/recruitment/aspirants/profile
   * Elimina el perfil base del aspirante.
   */
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content para eliminación exitosa
  async remove(@Req() req: CustomRequest): Promise<void> {
    const userId = req.user.id;
    await this.profileService.deleteProfile(userId);
  }
}
