import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JobOffersService } from './job-offers.service';
import { CreateJobOfferDto, UpdateJobOfferDto } from './dto/job-offer.dto';
//autenticacion
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../user/user.entity';
import { Public } from '../../../auth/decorators/public.decorator';

// Interfaz para tipar el objeto de solicitud con el usuario adjunto por el JwtAuthGuard
interface CustomRequest extends Request {
  user: {
    id: number;
    role: UserRole;
  };
}

@Controller('recruitment/offers')
export class JobOffersController {
  constructor(private readonly jobOffersService: JobOffersService) { }

  // RUTAS PÚBLICAS (No requieren autenticación)

  @Public()
  @Get()
  async findAll() {
    return this.jobOffersService.findAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jobOffersService.findOne(id);
  }

  // RUTAS PRIVADAS (Requieren Autenticación y Rol 'empresa')

  @UseGuards(JwtAuthGuard, RolesGuard) // Aplicar ambos guardias
  @Roles(UserRole.EMPRESA) // Restringir solo a empresas
  @Post()
  async create(
    @Req() req: CustomRequest,
    @Body() createJobOfferDto: CreateJobOfferDto,
  ) {
    const userId = req.user.id;
    return this.jobOffersService.create(userId, createJobOfferDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPRESA)
  @Put(':id')
  async update(
    @Req() req: CustomRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJobOfferDto: UpdateJobOfferDto,
  ) {
    const userId = req.user.id;
    return this.jobOffersService.update(userId, id, updateJobOfferDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPRESA)
  @Delete(':id')
  async remove(
    @Req() req: CustomRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user.id;
    return this.jobOffersService.remove(userId, id);
  }
}
