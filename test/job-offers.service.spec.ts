import { Test, TestingModule } from '@nestjs/testing';
import { JobOffersService } from '../src/recruitment/companies/job-offers/job-offers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JobOffer } from '../src/recruitment/companies/job-offers/job-offer.entity';
import { CompanyProfile } from '../src/recruitment/companies/entities/company-profile.entity';
import {
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';

describe('JobOffersService', () => {
    let service: JobOffersService;
    let jobOfferRepository;
    let companyProfileRepository;

    const mockJobOfferRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        merge: jest.fn(),
        delete: jest.fn(),
    };

    const mockCompanyProfileRepository = {
        findOneBy: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JobOffersService,
                {
                    provide: getRepositoryToken(JobOffer),
                    useValue: mockJobOfferRepository,
                },
                {
                    provide: getRepositoryToken(CompanyProfile),
                    useValue: mockCompanyProfileRepository,
                },
            ],
        }).compile();

        service = module.get<JobOffersService>(JobOffersService);
        jobOfferRepository = module.get(getRepositoryToken(JobOffer));
        companyProfileRepository = module.get(getRepositoryToken(CompanyProfile));

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all open job offers', async () => {
            const offers = [
                { id: 1, title: 'Developer', status: 'Abierta', company: {} },
                { id: 2, title: 'Designer', status: 'Abierta', company: {} },
            ];

            mockJobOfferRepository.find.mockResolvedValue(offers);

            const result = await service.findAll();

            expect(jobOfferRepository.find).toHaveBeenCalledWith({
                where: { status: 'Abierta' },
                relations: ['company'],
            });
            expect(result).toEqual(offers);
            expect(result).toHaveLength(2);
        });

        it('should return empty array if no offers found', async () => {
            mockJobOfferRepository.find.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        it('should return a job offer by id', async () => {
            const offer = {
                id: 1,
                title: 'Developer',
                company: { companyName: 'Tech Corp' },
            };

            mockJobOfferRepository.findOne.mockResolvedValue(offer);

            const result = await service.findOne(1);

            expect(jobOfferRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['company'],
            });
            expect(result).toEqual(offer);
        });

        it('should throw NotFoundException if offer not found', async () => {
            mockJobOfferRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
            await expect(service.findOne(999)).rejects.toThrow(
                'Oferta con ID 999 no encontrada.',
            );
        });
    });

    describe('create', () => {
        it('should create a new job offer', async () => {
            const userId = 1;
            const createDto = {
                title: 'Full Stack Developer',
                description: 'We are looking for...',
                salary: 50000,
                location: 'Madrid',
            };

            const companyProfile = { id: 10, userId, companyName: 'Tech Corp' };
            const newOffer = { id: 1, ...createDto, companyId: 10 };

            mockCompanyProfileRepository.findOneBy.mockResolvedValue(companyProfile);
            mockJobOfferRepository.create.mockReturnValue(newOffer);
            mockJobOfferRepository.save.mockResolvedValue(newOffer);

            const result = await service.create(userId, createDto);

            expect(companyProfileRepository.findOneBy).toHaveBeenCalledWith({
                userId,
            });
            expect(jobOfferRepository.create).toHaveBeenCalledWith({
                ...createDto,
                companyId: companyProfile.id,
            });
            expect(jobOfferRepository.save).toHaveBeenCalled();
            expect(result).toEqual(newOffer);
        });

        it('should throw BadRequestException if company profile does not exist', async () => {
            const userId = 1;
            const createDto = { title: 'Developer' } as any;

            mockCompanyProfileRepository.findOneBy.mockResolvedValue(null);

            await expect(service.create(userId, createDto)).rejects.toThrow(
                BadRequestException,
            );
            await expect(service.create(userId, createDto)).rejects.toThrow(
                'El usuario no tiene un perfil de empresa configurado. Cree uno primero.',
            );
        });
    });

    describe('update', () => {
        it('should update an existing job offer', async () => {
            const userId = 1;
            const offerId = 1;
            const updateDto = { title: 'Senior Developer', salary: 60000 };

            const existingOffer = {
                id: offerId,
                title: 'Developer',
                salary: 50000,
                company: { id: 10, userId },
            };

            const updatedOffer = { ...existingOffer, ...updateDto };

            mockJobOfferRepository.findOne.mockResolvedValue(existingOffer);
            mockJobOfferRepository.merge.mockImplementation((target, source) => {
                Object.assign(target, source);
                return target;
            });
            mockJobOfferRepository.save.mockResolvedValue(updatedOffer);

            const result = await service.update(userId, offerId, updateDto);

            expect(jobOfferRepository.findOne).toHaveBeenCalledWith({
                where: { id: offerId },
                relations: ['company'],
            });
            expect(jobOfferRepository.merge).toHaveBeenCalledWith(
                existingOffer,
                updateDto,
            );
            expect(jobOfferRepository.save).toHaveBeenCalled();
            expect(result.title).toBe('Senior Developer');
        });

        it('should throw NotFoundException if offer does not exist', async () => {
            mockJobOfferRepository.findOne.mockResolvedValue(null);

            await expect(service.update(1, 999, {} as any)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw ForbiddenException if user is not the owner', async () => {
            const userId = 1;
            const offerId = 1;
            const updateDto = { title: 'Updated' };

            const existingOffer = {
                id: offerId,
                company: { id: 10, userId: 2 }, // Different user
            };

            mockJobOfferRepository.findOne.mockResolvedValue(existingOffer);

            await expect(service.update(userId, offerId, updateDto)).rejects.toThrow(
                ForbiddenException,
            );
            await expect(service.update(userId, offerId, updateDto)).rejects.toThrow(
                'No tienes permiso para modificar esta oferta.',
            );
        });
    });

    describe('remove', () => {
        it('should delete a job offer', async () => {
            const userId = 1;
            const offerId = 1;

            const existingOffer = {
                id: offerId,
                title: 'Developer',
                company: { id: 10, userId },
            };

            mockJobOfferRepository.findOne.mockResolvedValue(existingOffer);
            mockJobOfferRepository.delete.mockResolvedValue({ affected: 1 });

            const result = await service.remove(userId, offerId);

            expect(jobOfferRepository.findOne).toHaveBeenCalledWith({
                where: { id: offerId },
                relations: ['company'],
            });
            expect(jobOfferRepository.delete).toHaveBeenCalledWith(offerId);
            expect(result).toEqual({
                deleted: true,
                message: `Oferta ${offerId} eliminada exitosamente.`,
            });
        });

        it('should return failure message if offer not found', async () => {
            mockJobOfferRepository.findOne.mockResolvedValue(null);

            const result = await service.remove(1, 999);

            expect(result).toEqual({
                deleted: false,
                message: 'Oferta no encontrada.',
            });
        });

        it('should throw BadRequestException if user is not the owner', async () => {
            const userId = 1;
            const offerId = 1;

            const existingOffer = {
                id: offerId,
                company: { id: 10, userId: 2 }, // Different user
            };

            mockJobOfferRepository.findOne.mockResolvedValue(existingOffer);

            await expect(service.remove(userId, offerId)).rejects.toThrow(
                BadRequestException,
            );
            await expect(service.remove(userId, offerId)).rejects.toThrow(
                'No tienes permiso para eliminar esta oferta.',
            );
        });
    });
});
