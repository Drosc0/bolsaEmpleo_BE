import { Test, TestingModule } from '@nestjs/testing';
import { CompanyProfileService } from '../src/recruitment/companies/profile/company-profile.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompanyProfile } from '../src/recruitment/companies/entities/company-profile.entity';
import { User, UserRole } from '../src/user/user.entity';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('CompanyProfileService', () => {
    let service: CompanyProfileService;
    let companyProfileRepository;
    let userRepository;

    const mockCompanyProfileRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOneBy: jest.fn(),
        findOne: jest.fn(),
        merge: jest.fn(),
    };

    const mockUserRepository = {
        findOneBy: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CompanyProfileService,
                {
                    provide: getRepositoryToken(CompanyProfile),
                    useValue: mockCompanyProfileRepository,
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        service = module.get<CompanyProfileService>(CompanyProfileService);
        companyProfileRepository = module.get(getRepositoryToken(CompanyProfile));
        userRepository = module.get(getRepositoryToken(User));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createDefault', () => {
        it('should create a default profile', async () => {
            const user = { id: 1 } as User;
            const dto = { user, email: 'test@company.com', companyName: 'Test Company' };
            const savedProfile = { id: 1, userId: 1, ...dto };

            mockCompanyProfileRepository.create.mockReturnValue(savedProfile);
            mockCompanyProfileRepository.save.mockResolvedValue(savedProfile);

            const result = await service.createDefault(dto);

            expect(companyProfileRepository.create).toHaveBeenCalled();
            expect(companyProfileRepository.save).toHaveBeenCalled();
            expect(result).toEqual(savedProfile);
        });
    });

    describe('create', () => {
        it('should create a profile if user is company and has no profile', async () => {
            const userId = 1;
            const createDto = { name: 'New Company', description: 'Desc', websiteUrl: 'http://web.com', address: 'Address' };
            const user = { id: userId, role: UserRole.EMPRESA };

            mockCompanyProfileRepository.findOneBy.mockResolvedValue(null);
            mockUserRepository.findOneBy.mockResolvedValue(user);
            mockCompanyProfileRepository.create.mockReturnValue({ ...createDto, userId });
            mockCompanyProfileRepository.save.mockResolvedValue({ id: 1, ...createDto, userId });

            const result = await service.create(userId, createDto);

            expect(result).toBeDefined();
            expect(companyProfileRepository.save).toHaveBeenCalled();
        });

        it('should throw BadRequestException if profile already exists', async () => {
            const userId = 1;
            mockCompanyProfileRepository.findOneBy.mockResolvedValue({ id: 1 });

            await expect(service.create(userId, {} as any)).rejects.toThrow(BadRequestException);
        });

        it('should throw ForbiddenException if user is not a company', async () => {
            const userId = 1;
            const user = { id: userId, role: UserRole.ASPIRANTE };

            mockCompanyProfileRepository.findOneBy.mockResolvedValue(null);
            mockUserRepository.findOneBy.mockResolvedValue(user);

            await expect(service.create(userId, {} as any)).rejects.toThrow(ForbiddenException);
        });
    });

    describe('findMyProfile', () => {
        it('should return profile if found', async () => {
            const userId = 1;
            const profile = { id: 1, userId };

            mockCompanyProfileRepository.findOne.mockResolvedValue(profile);

            const result = await service.findMyProfile(userId);

            expect(result).toEqual(profile);
        });

        it('should throw NotFoundException if not found', async () => {
            const userId = 1;
            mockCompanyProfileRepository.findOne.mockResolvedValue(null);

            await expect(service.findMyProfile(userId)).rejects.toThrow(NotFoundException);
        });
    });
});
