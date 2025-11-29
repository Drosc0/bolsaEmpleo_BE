import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Req,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto, UpdateProfileDto } from '../dto/profile.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../user/user.entity';

// Interfaz para tipar el objeto de solicitud con el usuario
interface CustomRequest extends Request {
  user: {
    id: number;
    role: UserRole;
  };
}

@Controller('recruitment/profile')
// Aplica el guardia de autenticación a TODO el controlador
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ASPIRANTE) // Restringe TODO el controlador solo al rol 'aspirante'
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // 1. OBTENER PERFIL (GET /api/recruitment/profile)
  // El userId se extrae automáticamente del token por el JwtAuthGuard
  @Get()
  async findOne(@Req() req: CustomRequest) {
    // req.user contiene el objeto User adjuntado por el JwtStrategy
    const userId = req.user.id;
    return this.profileService.findByUserId(userId);
  }

  // 2. CREAR PERFIL (POST /api/recruitment/profile)
  @Post()
  async create(
    @Req() req: CustomRequest,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    const userId = req.user.id;
    // Ahora solo los aspirantes pueden intentar crear un perfil
    return this.profileService.create(userId, createProfileDto);
  }

  // 3. ACTUALIZAR PERFIL (PUT /api/recruitment/profile)
  @Put()
  async update(
    @Req() req: CustomRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const userId = req.user.id;
    return this.profileService.updateByUserId(userId, updateProfileDto);
  }

  // 4. ELIMINAR PERFIL (DELETE /api/recruitment/profile)
  @Delete()
  async delete(@Req() req: CustomRequest) {
    const userId = req.user.id;
    return this.profileService.deleteProfile(userId);
  }
}
