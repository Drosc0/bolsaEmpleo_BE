import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Req,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { Request } from 'express';

import { CompanyProfileService } from './company-profile.service';
import {
  CreateCompanyProfileDto,
  UpdateCompanyProfileDto,
} from '../dto/company-profile.dto';
import { CompanyProfile } from '../entities/company-profile.entity';

// Autenticación y Roles
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../user/user.entity';

// Interfaz para tipar el objeto de solicitud con el usuario adjunto
interface CustomRequest extends Request {
  user: {
    id: number;
    role: UserRole;
  };
}

@Controller('recruitment/company-profile')
@UseGuards(JwtAuthGuard, RolesGuard) // Aplicamos guardias a todo el controlador
@Roles(UserRole.EMPRESA) // Restringe el acceso de la clase al rol EMPRESA
export class CompanyProfileController {
  constructor(private readonly companyProfileService: CompanyProfileService) {}

  // 1. GESTIÓN DEL PROPIO PERFIL (Requiere Auth + Rol EMPRESA)

  /**
   * POST /api/recruitment/company-profile
   * Crea el perfil de empresa. Solo si el usuario no tiene uno.
   */
  @Post()
  async create(
    @Req() req: CustomRequest,
    @Body() createProfileDto: CreateCompanyProfileDto,
  ): Promise<CompanyProfile> {
    const userId = req.user.id;
    return await this.companyProfileService.create(userId, createProfileDto);
  }

  /**
   * GET /api/recruitment/company-profile/me
   * Obtiene el perfil de empresa del usuario autenticado, incluyendo sus ofertas.
   */
  @Get('me')
  async findMyProfile(@Req() req: CustomRequest): Promise<CompanyProfile> {
    const userId = req.user.id;
    return await this.companyProfileService.findMyProfile(userId);
  }

  /**
   * PUT /api/recruitment/company-profile
   * Actualiza el perfil de empresa del usuario autenticado.
   */
  @Put()
  async update(
    @Req() req: CustomRequest,
    @Body() updateProfileDto: UpdateCompanyProfileDto,
  ): Promise<CompanyProfile> {
    const userId = req.user.id;
    // La lógica de actualización en el servicio verifica que el perfil exista para este userId
    return await this.companyProfileService.update(userId, updateProfileDto);
  }

  // =========================================================================
  // 2. RUTA PÚBLICA (Solo lectura de perfiles específicos)
  // =========================================================================

  /**
   * GET /api/recruitment/company-profile/:id
   * Permite obtener el perfil de CUALQUIER empresa por ID.
   * Debe anular las restricciones de Rol, permitiendo el acceso público.
   * La validación de UserRole.EMPRESA debe ser explícita en este caso.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard) // Puede ser pública o solo requerir JWT si no es 'me'
  @Roles(UserRole.ASPIRANTE, UserRole.EMPRESA) // Permite acceso a todos los usuarios logueados
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CompanyProfile> {
    return await this.companyProfileService.findOne(id);
  }
}
