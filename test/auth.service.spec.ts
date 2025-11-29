import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../src/user/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ProfileService } from '../src/recruitment/aspirants/profile/profile.service';
import { CompanyProfileService } from '../src/recruitment/companies/profile/company-profile.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
    let service: AuthService;
    let usersRepository;
    let jwtService;
    let aspirantProfileService;
    let companyProfileService;

    const mockUserRepository = {
        findOneBy: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn(),
    };

    const mockAspirantProfileService = {
        createDefault: jest.fn(),
    };

    const mockCompanyProfileService = {
        createDefault: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: ProfileService,
                    useValue: mockAspirantProfileService,
                },
                {
                    provide: CompanyProfileService,
                    useValue: mockCompanyProfileService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersRepository = module.get(getRepositoryToken(User));
        jwtService = module.get(JwtService);
        aspirantProfileService = module.get(ProfileService);
        companyProfileService = module.get(CompanyProfileService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('register', () => {
        it('should successfully register a new user', async () => {
            const registerDto = {
                email: 'test@example.com',
                password: 'password123',
                role: UserRole.ASPIRANTE,
            };

            const hashedPassword = 'hashedPassword';
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

            mockUserRepository.findOneBy.mockResolvedValue(null);
            mockUserRepository.create.mockReturnValue({ ...registerDto, password: hashedPassword });
            mockUserRepository.save.mockResolvedValue({ id: 1, ...registerDto, password: hashedPassword });
            mockJwtService.sign.mockReturnValue('mockToken');

            const result = await service.register(registerDto);

            expect(usersRepository.findOneBy).toHaveBeenCalledWith({ email: registerDto.email });
            expect(usersRepository.save).toHaveBeenCalled();
            expect(aspirantProfileService.createDefault).toHaveBeenCalled();
            expect(result).toEqual({
                token: 'mockToken',
                userId: 1,
                role: UserRole.ASPIRANTE,
            });
        });

        it('should throw BadRequestException if email already exists', async () => {
            const registerDto = {
                email: 'existing@example.com',
                password: 'password123',
                role: UserRole.ASPIRANTE,
            };

            mockUserRepository.findOneBy.mockResolvedValue({ id: 1, email: registerDto.email });

            await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('login', () => {
        it('should return token and user info for valid credentials', async () => {
            const loginDto = {
                email: 'test@example.com',
                password: 'password123',
            };

            const user = {
                id: 1,
                email: loginDto.email,
                password: 'hashedPassword',
                role: UserRole.ASPIRANTE,
            };

            mockUserRepository.findOneBy.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockJwtService.sign.mockReturnValue('mockToken');

            const result = await service.login(loginDto);

            expect(usersRepository.findOneBy).toHaveBeenCalledWith({ email: loginDto.email });
            expect(result).toEqual({
                token: 'mockToken',
                userId: 1,
                role: UserRole.ASPIRANTE,
            });
        });

        it('should throw UnauthorizedException for invalid password', async () => {
            const loginDto = {
                email: 'test@example.com',
                password: 'wrongPassword',
            };

            const user = {
                id: 1,
                email: loginDto.email,
                password: 'hashedPassword',
                role: UserRole.ASPIRANTE,
            };

            mockUserRepository.findOneBy.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if user not found', async () => {
            const loginDto = {
                email: 'nonexistent@example.com',
                password: 'password123',
            };

            mockUserRepository.findOneBy.mockResolvedValue(null);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });
    });
});
