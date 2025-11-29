import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Req,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { Request } from 'express'; // Importar Request de Express
import { ApplicationsService } from './applications.service';
import {
  CreateApplicationDto,
  UpdateApplicationStatusDto,
} from './dto/application.dto';
import { Application } from './entities/application.entity';
// Autenticación y Roles
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../user/user.entity';

// Interfaz para tipar el objeto de solicitud con el usuario adjunto por el JwtAuthGuard
interface CustomRequest extends Request {
  user: {
    id: number;
    role: UserRole;
  };
}

@Controller('recruitment/applications')
@UseGuards(JwtAuthGuard, RolesGuard) // Aplicamos guardias globalmente al controlador
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  // 1. RUTA PARA ASPIRANTES

  /**
   * POST /api/recruitment/applications
   * Permite a un aspirante aplicar a una oferta de trabajo específica.
   */
  @Post()
  @Roles(UserRole.ASPIRANTE)
  apply(
    @Req() req: CustomRequest,
    @Body() createApplicationDto: CreateApplicationDto,
  ): Promise<Application> {
    const userId = req.user.id;
    return this.applicationsService.createApplication(
      userId,
      createApplicationDto.jobOfferId,
    );
  }

  // 2. RUTAS PARA EMPRESAS

  /**
   * GET /api/recruitment/applications/company
   * Obtiene TODAS las postulaciones que corresponden a las ofertas de la empresa
   * del usuario autenticado.
   */
  @Get('company')
  @Roles(UserRole.EMPRESA)
  findCompanyApplications(@Req() req: CustomRequest): Promise<Application[]> {
    const userId = req.user.id;
    return this.applicationsService.findAllByCompany(userId);
  }

  /**
   * PUT /api/recruitment/applications/:id/status
   * Permite a la empresa actualizar el estado de una postulación específica.
   */
  @Put(':id/status')
  @Roles(UserRole.EMPRESA)
  updateStatus(
    @Req() req: CustomRequest,
    @Param('id', ParseIntPipe) applicationId: number,
    @Body() updateStatusDto: UpdateApplicationStatusDto,
  ): Promise<Application> {
    const userId = req.user.id;
    return this.applicationsService.updateStatus(
      userId,
      applicationId,
      updateStatusDto,
    );
  }

  // 3. RUTA PARA ASPIRANTES (VER SUS POSTULACIONES)

  /**
   * GET /api/recruitment/applications/me
   * Obtiene todas las postulaciones realizadas por el aspirante autenticado.
   */
  @Get('me')
  @Roles(UserRole.ASPIRANTE)
  findMyApplications(@Req() req: CustomRequest): Promise<Application[]> {
    const userId = req.user.id;
    return this.applicationsService.findAllByAspirant(userId);
  }
}
