import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Req,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';

import { SkillItemService } from './skill-item.service';
import { CreateSkillItemDto, UpdateSkillItemDto } from '../dto/skill-item.dto'; // Asumimos estos DTOs
import { SkillItem } from '../entities/skill-item.entity';

// Autenticación y Roles
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/user.entity';

// Interfaz para tipar el objeto de solicitud con el usuario adjunto
interface CustomRequest extends Request {
  user: {
    id: number;
    role: UserRole;
  };
}

@Controller('recruitment/aspirants/skills')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ASPIRANTE) // Solo aspirantes pueden gestionar sus habilidades
export class SkillItemController {
  // El inyector del constructor asegura que el tipo sea explícito
  constructor(private readonly skillItemService: SkillItemService) {}

  /**
   * POST /api/recruitment/aspirants/skills
   * Añade una nueva habilidad al perfil del aspirante.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: CustomRequest,
    @Body() createSkillDto: CreateSkillItemDto,
  ): Promise<SkillItem> {
    const userId = req.user.id;
    return this.skillItemService.create(userId, createSkillDto);
  }

  /**
   * PUT /api/recruitment/aspirants/skills/:id
   * Actualiza una habilidad específica por ID.
   */
  @Put(':id')
  async update(
    @Req() req: CustomRequest,
    @Param('id', ParseIntPipe) skillId: number,
    @Body() updateSkillDto: UpdateSkillItemDto,
  ): Promise<SkillItem> {
    const userId = req.user.id;
    return this.skillItemService.update(userId, skillId, updateSkillDto);
  }

  /**
   * DELETE /api/recruitment/aspirants/skills/:id
   * Elimina una habilidad específica por ID.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: CustomRequest,
    @Param('id', ParseIntPipe) skillId: number,
  ): Promise<void> {
    const userId = req.user.id;
    return this.skillItemService.remove(userId, skillId);
  }
}
