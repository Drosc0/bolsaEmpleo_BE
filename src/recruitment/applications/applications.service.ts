import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from './entities/application.entity';
import { JobOffer } from '../companies/job-offers/job-offer.entity';
import { AspirantProfile } from '../aspirants/entities/aspirant-profile.entity';
import { UpdateApplicationStatusDto } from './dto/application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(JobOffer)
    private jobOfferRepository: Repository<JobOffer>,
    @InjectRepository(AspirantProfile)
    private aspirantProfileRepository: Repository<AspirantProfile>,
  ) { }

  // LÓGICA DE POSTULACIÓN (ASPIRANTE)

  /**
   * Crea una nueva postulación para un aspirante.
   */

  async createApplication(
    userId: number,
    jobOfferId: number,
  ): Promise<Application> {
    try {
      // 1. Verificar el Perfil del Aspirante
      const aspirantProfile = await this.aspirantProfileRepository.findOneBy({
        userId,
      });
      if (!aspirantProfile) {
        throw new BadRequestException(
          'El usuario debe completar su perfil de aspirante antes de postularse.',
        );
      }

      // 2. Verificar la Oferta de Trabajo
      const jobOffer = await this.jobOfferRepository.findOneBy({
        id: jobOfferId,
      });
      if (!jobOffer) {
        throw new NotFoundException('La oferta de trabajo no existe.');
      }

      // 3. Verificar Postulación Duplicada
      const existingApplication = await this.applicationRepository
        .createQueryBuilder('app')
        .innerJoin('app.aspirantProfile', 'aspirant')
        .innerJoin('app.jobOffer', 'offer')
        .where('aspirant.id = :aspirantId', { aspirantId: aspirantProfile.id })
        .andWhere('offer.id = :offerId', { offerId: jobOfferId })
        .getOne();

      if (existingApplication) {
        throw new BadRequestException(
          'Ya te has postulado a esta oferta de trabajo.',
        );
      }

      // 4. Crear y Guardar Postulación
      const newApplication = this.applicationRepository.create({
        aspirantProfile: aspirantProfile,
        jobOffer: jobOffer,
        appliedAt: new Date(),
        status: ApplicationStatus.PENDING,
      });

      return await this.applicationRepository.save(newApplication);
    } catch (error) {
      // Manejo de errores que previene el warning 'Unsafe call'
      console.error('Error al crear postulación:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error interno al procesar la postulación.',
      );
    }
  }

  /**
   * Obtiene todas las postulaciones realizadas por el aspirante autenticado.
   */
  async findAllByAspirant(userId: number): Promise<Application[]> {
    const aspirantProfile = await this.aspirantProfileRepository.findOneBy({
      userId,
    });
    if (!aspirantProfile) {
      return [];
    }

    // para buscar por ID de aspirante y cargar relaciones
    return this.applicationRepository
      .createQueryBuilder('app')
      .where('app.aspirantId = :id', { id: aspirantProfile.id })
      .leftJoinAndSelect('app.jobOffer', 'jobOffer')
      .leftJoinAndSelect('jobOffer.company', 'company')
      .getMany();
  }

  // LÓGICA DE GESTIÓN (EMPRESA)

  /**
   * Obtiene todas las postulaciones para las ofertas de la empresa del usuario.
   */
  async findAllByCompany(userId: number): Promise<Application[]> {
    // Usamos un QueryBuilder para una búsqueda más eficiente y segura.
    try {
      const applications = await this.applicationRepository
        .createQueryBuilder('app')
        .innerJoinAndSelect('app.jobOffer', 'offer')
        .innerJoin('offer.company', 'company')
        .innerJoin('company.user', 'user')
        .where('user.id = :userId', { userId })
        .leftJoinAndSelect('app.aspirantProfile', 'aspirant') // Cargamos los datos del aspirante
        .leftJoinAndSelect('aspirant.user', 'aspirantUser') // Cargamos los datos del User del aspirante
        .getMany();

      return applications;
    } catch (error) {
      console.error('Error al obtener postulaciones de la empresa:', error);
      throw new InternalServerErrorException(
        'Error al obtener las postulaciones.',
      );
    }
  }

  /**
   * Obtiene todas las postulaciones para una oferta específica.
   */
  async findAllByOffer(offerId: number): Promise<Application[]> {
    try {
      const applications = await this.applicationRepository
        .createQueryBuilder('app')
        .where('app.jobOfferId = :offerId', { offerId })
        .leftJoinAndSelect('app.aspirantProfile', 'aspirant')
        .leftJoinAndSelect('aspirant.user', 'aspirantUser')
        .getMany();

      return applications;
    } catch (error) {
      console.error('Error al obtener postulaciones de la oferta:', error);
      throw new InternalServerErrorException(
        'Error al obtener las postulaciones.',
      );
    }
  }

  /**
   * Actualiza el estado de una postulación específica, verificando permisos.
   */
  async updateStatus(
    companyUserId: number,
    applicationId: number,
    updateStatusDto: UpdateApplicationStatusDto,
  ): Promise<Application> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['jobOffer', 'jobOffer.company', 'jobOffer.company.user'],
    });

    if (!application) {
      throw new NotFoundException('Postulación no encontrada.');
    }

    // 1. Verificar Permisos: Asegurarse de que el usuario sea el dueño de la oferta
    if (application.jobOffer.company.user.id !== companyUserId) {
      throw new ForbiddenException(
        'No tienes permiso para modificar el estado de esta postulación.',
      );
    }

    // 2. Aplicar Actualización y Guardar
    application.status = updateStatusDto.status;
    if (updateStatusDto.internalNote) {
      application.internalNote = updateStatusDto.internalNote;
    }

    try {
      return await this.applicationRepository.save(application);
    } catch (error) {
      console.error('Error al actualizar estado de postulación:', error);
      throw new InternalServerErrorException(
        'Error al guardar el nuevo estado.',
      );
    }
  }
}
