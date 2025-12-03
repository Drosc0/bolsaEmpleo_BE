import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from '../src/recruitment/applications/applications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
    Application,
    ApplicationStatus,
} from '../src/recruitment/applications/entities/application.entity';
import { JobOffer } from '../src/recruitment/companies/job-offers/job-offer.entity';
import { AspirantProfile } from '../src/recruitment/aspirants/entities/aspirant-profile.entity';
import {
    BadRequestException,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
} from '@nestjs/common';

describe('ApplicationsService', () => {
    let service: ApplicationsService;
    let applicationRepository;
    let jobOfferRepository;
    let aspirantProfileRepository;

    const mockApplicationRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        createQueryBuilder: jest.fn(),
    };

    const mockJobOfferRepository = {
        findOneBy: jest.fn(),
    };

    const mockAspirantProfileRepository = {
        findOneBy: jest.fn(),
    };

    const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ApplicationsService,
                {
                    provide: getRepositoryToken(Application),
                    useValue: mockApplicationRepository,
                },
                {
                    provide: getRepositoryToken(JobOffer),
                    useValue: mockJobOfferRepository,
                },
                {
                    provide: getRepositoryToken(AspirantProfile),
                    useValue: mockAspirantProfileRepository,
                },
            ],
        }).compile();

        service = module.get<ApplicationsService>(ApplicationsService);
        applicationRepository = module.get(getRepositoryToken(Application));
        jobOfferRepository = module.get(getRepositoryToken(JobOffer));
        aspirantProfileRepository = module.get(
            getRepositoryToken(AspirantProfile),
        );

        jest.clearAllMocks();
        mockApplicationRepository.createQueryBuilder.mockReturnValue(
            mockQueryBuilder,
        );
    });

    it('debería estar definido', () => {
        expect(service).toBeDefined();
    });

    describe('createApplication', () => {
        it('debería crear una nueva postulación exitosamente', async () => {
            const userId = 1;
            const jobOfferId = 10;

            const aspirantProfile = { id: 5, userId };
            const jobOffer = { id: jobOfferId, title: 'Developer' };
            const newApplication = {
                id: 1,
                aspirantProfile,
                jobOffer,
                status: ApplicationStatus.PENDING,
            };

            mockAspirantProfileRepository.findOneBy.mockResolvedValue(
                aspirantProfile,
            );
            mockJobOfferRepository.findOneBy.mockResolvedValue(jobOffer);
            mockQueryBuilder.getOne.mockResolvedValue(null); // No existing application
            mockApplicationRepository.create.mockReturnValue(newApplication);
            mockApplicationRepository.save.mockResolvedValue(newApplication);

            const result = await service.createApplication(userId, jobOfferId);

            expect(aspirantProfileRepository.findOneBy).toHaveBeenCalledWith({
                userId,
            });
            expect(jobOfferRepository.findOneBy).toHaveBeenCalledWith({
                id: jobOfferId,
            });
            expect(applicationRepository.save).toHaveBeenCalled();
            expect(result.status).toBe(ApplicationStatus.PENDING);
        });

        it('debería lanzar BadRequestException si el perfil del aspirante no existe', async () => {
            mockAspirantProfileRepository.findOneBy.mockResolvedValue(null);

            await expect(service.createApplication(1, 10)).rejects.toThrow(
                BadRequestException,
            );
            await expect(service.createApplication(1, 10)).rejects.toThrow(
                'El usuario debe completar su perfil de aspirante antes de postularse.',
            );
        });

        it('debería lanzar NotFoundException si la oferta de trabajo no existe', async () => {
            const aspirantProfile = { id: 5, userId: 1 };

            mockAspirantProfileRepository.findOneBy.mockResolvedValue(
                aspirantProfile,
            );
            mockJobOfferRepository.findOneBy.mockResolvedValue(null);

            await expect(service.createApplication(1, 999)).rejects.toThrow(
                NotFoundException,
            );
            await expect(service.createApplication(1, 999)).rejects.toThrow(
                'La oferta de trabajo no existe.',
            );
        });

        it('debería lanzar BadRequestException si ya se ha postulado', async () => {
            const userId = 1;
            const jobOfferId = 10;
            const aspirantProfile = { id: 5, userId };
            const jobOffer = { id: jobOfferId };
            const existingApplication = { id: 1 };

            mockAspirantProfileRepository.findOneBy.mockResolvedValue(
                aspirantProfile,
            );
            mockJobOfferRepository.findOneBy.mockResolvedValue(jobOffer);
            mockQueryBuilder.getOne.mockResolvedValue(existingApplication);

            await expect(
                service.createApplication(userId, jobOfferId),
            ).rejects.toThrow(BadRequestException);
            await expect(
                service.createApplication(userId, jobOfferId),
            ).rejects.toThrow('Ya te has postulado a esta oferta de trabajo.');
        });

        it('debería lanzar InternalServerErrorException en caso de error inesperado', async () => {
            const aspirantProfile = { id: 5, userId: 1 };

            mockAspirantProfileRepository.findOneBy.mockResolvedValue(
                aspirantProfile,
            );
            mockJobOfferRepository.findOneBy.mockRejectedValue(
                new Error('DB Error'),
            );

            await expect(service.createApplication(1, 10)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('findAllByAspirant', () => {
        it('debería retornar todas las postulaciones de un aspirante', async () => {
            const userId = 1;
            const aspirantProfile = { id: 5, userId };
            const applications = [
                { id: 1, jobOffer: { title: 'Developer' } },
                { id: 2, jobOffer: { title: 'Designer' } },
            ];

            mockAspirantProfileRepository.findOneBy.mockResolvedValue(
                aspirantProfile,
            );
            mockQueryBuilder.getMany.mockResolvedValue(applications);

            const result = await service.findAllByAspirant(userId);

            expect(aspirantProfileRepository.findOneBy).toHaveBeenCalledWith({
                userId,
            });
            expect(result).toEqual(applications);
            expect(result).toHaveLength(2);
        });

        it('debería retornar un array vacío si el perfil del aspirante no existe', async () => {
            mockAspirantProfileRepository.findOneBy.mockResolvedValue(null);

            const result = await service.findAllByAspirant(999);

            expect(result).toEqual([]);
        });
    });

    describe('findAllByCompany', () => {
        it('debería retornar todas las postulaciones para una empresa', async () => {
            const userId = 1;
            const applications = [
                {
                    id: 1,
                    jobOffer: { title: 'Developer' },
                    aspirantProfile: { firstName: 'John' },
                },
            ];

            mockQueryBuilder.getMany.mockResolvedValue(applications);

            const result = await service.findAllByCompany(userId);

            expect(applicationRepository.createQueryBuilder).toHaveBeenCalled();
            expect(result).toEqual(applications);
        });

        it('debería lanzar InternalServerErrorException en caso de error', async () => {
            mockQueryBuilder.getMany.mockRejectedValue(new Error('DB Error'));

            await expect(service.findAllByCompany(1)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('findAllByOffer', () => {
        it('debería retornar todas las postulaciones para una oferta específica', async () => {
            const offerId = 10;
            const applications = [
                { id: 1, aspirantProfile: { firstName: 'John' } },
                { id: 2, aspirantProfile: { firstName: 'Jane' } },
            ];

            mockQueryBuilder.getMany.mockResolvedValue(applications);

            const result = await service.findAllByOffer(offerId);

            expect(result).toEqual(applications);
            expect(result).toHaveLength(2);
        });

        it('debería lanzar InternalServerErrorException en caso de error', async () => {
            mockQueryBuilder.getMany.mockRejectedValue(new Error('DB Error'));

            await expect(service.findAllByOffer(10)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('updateStatus', () => {
        it('debería actualizar el estado de la postulación exitosamente', async () => {
            const companyUserId = 1;
            const applicationId = 5;
            const updateDto = {
                status: ApplicationStatus.HIRED,
                internalNote: 'Good candidate',
            };

            const application = {
                id: applicationId,
                status: ApplicationStatus.PENDING,
                jobOffer: {
                    company: {
                        user: { id: companyUserId },
                    },
                },
            };

            const updatedApplication = {
                ...application,
                status: ApplicationStatus.HIRED,
                internalNote: 'Good candidate',
            };

            mockApplicationRepository.findOne.mockResolvedValue(application);
            mockApplicationRepository.save.mockResolvedValue(updatedApplication);

            const result = await service.updateStatus(
                companyUserId,
                applicationId,
                updateDto,
            );

            expect(applicationRepository.findOne).toHaveBeenCalledWith({
                where: { id: applicationId },
                relations: ['jobOffer', 'jobOffer.company', 'jobOffer.company.user'],
            });
            expect(applicationRepository.save).toHaveBeenCalled();
            expect(result.status).toBe(ApplicationStatus.HIRED);
        });

        it('debería lanzar NotFoundException si la postulación no existe', async () => {
            mockApplicationRepository.findOne.mockResolvedValue(null);

            await expect(
                service.updateStatus(1, 999, { status: ApplicationStatus.HIRED }),
            ).rejects.toThrow(NotFoundException);
        });

        it('debería lanzar ForbiddenException si el usuario no es el propietario', async () => {
            const companyUserId = 1;
            const applicationId = 5;
            const updateDto = { status: ApplicationStatus.HIRED };

            const application = {
                id: applicationId,
                jobOffer: {
                    company: {
                        user: { id: 2 }, // Different user
                    },
                },
            };

            mockApplicationRepository.findOne.mockResolvedValue(application);

            await expect(
                service.updateStatus(companyUserId, applicationId, updateDto),
            ).rejects.toThrow(ForbiddenException);
            await expect(
                service.updateStatus(companyUserId, applicationId, updateDto),
            ).rejects.toThrow(
                'No tienes permiso para modificar el estado de esta postulación.',
            );
        });

        it('debería lanzar InternalServerErrorException en caso de error al guardar', async () => {
            const application = {
                id: 5,
                jobOffer: { company: { user: { id: 1 } } },
            };

            mockApplicationRepository.findOne.mockResolvedValue(application);
            mockApplicationRepository.save.mockRejectedValue(new Error('DB Error'));

            await expect(
                service.updateStatus(1, 5, { status: ApplicationStatus.HIRED }),
            ).rejects.toThrow(InternalServerErrorException);
        });
    });
});
