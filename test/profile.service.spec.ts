import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from '../src/recruitment/aspirants/profile/profile.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AspirantProfile } from '../src/recruitment/aspirants/entities/aspirant-profile.entity';
import { ExperienceItem } from '../src/recruitment/aspirants/entities/experience-item.entity';
import { SkillItem, SkillLevel } from '../src/recruitment/aspirants/entities/skill-item.entity';
import { User } from '../src/user/user.entity';
import {
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('ProfileService', () => {
  let service: ProfileService;
  let profileRepository;
  let experienceRepository;
  let skillRepository;

  const mockProfileRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  const mockExperienceRepository = {
    create: jest.fn(),
    delete: jest.fn(),
  };

  const mockSkillRepository = {
    create: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: getRepositoryToken(AspirantProfile),
          useValue: mockProfileRepository,
        },
        {
          provide: getRepositoryToken(ExperienceItem),
          useValue: mockExperienceRepository,
        },
        {
          provide: getRepositoryToken(SkillItem),
          useValue: mockSkillRepository,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    profileRepository = module.get(getRepositoryToken(AspirantProfile));
    experienceRepository = module.get(getRepositoryToken(ExperienceItem));
    skillRepository = module.get(getRepositoryToken(SkillItem));

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDefault', () => {
    it('should create a default profile for a user', async () => {
      const user = { id: 1, email: 'test@example.com' } as User;
      const expectedProfile = { id: 1, userId: 1, email: 'test@example.com' };

      mockProfileRepository.create.mockReturnValue(expectedProfile);
      mockProfileRepository.save.mockResolvedValue(expectedProfile);

      const result = await service.createDefault(user);

      expect(profileRepository.create).toHaveBeenCalledWith({
        userId: user.id,
        email: user.email,
      });
      expect(profileRepository.save).toHaveBeenCalled();
      expect(result).toEqual(expectedProfile);
    });

    it('should throw InternalServerErrorException on error', async () => {
      const user = { id: 1, email: 'test@example.com' } as User;

      mockProfileRepository.create.mockReturnValue({});
      mockProfileRepository.save.mockRejectedValue(new Error('DB Error'));

      await expect(service.createDefault(user)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findByUserId', () => {
    it('should return a profile with relations', async () => {
      const userId = 1;
      const profile = {
        id: 1,
        userId,
        experience: [],
        skills: [],
      };

      mockProfileRepository.findOne.mockResolvedValue(profile);

      const result = await service.findByUserId(userId);

      expect(profileRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
        relations: ['experience', 'skills'],
      });
      expect(result).toEqual(profile);
    });

    it('should return null if profile not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      const result = await service.findByUserId(999);

      expect(result).toBeNull();
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockProfileRepository.findOne.mockRejectedValue(new Error('DB Error'));

      await expect(service.findByUserId(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('create', () => {
    it('should create a new profile with skills and experience', async () => {
      const userId = 1;
      const createDto = {
        firstName: 'John',
        lastName: 'Doe',
        skills: [{ name: 'JavaScript', level: 4 }],
        experience: [
          {
            company: 'Tech Corp',
            position: 'Developer',
            startDate: new Date('2020-01-01'),
            endDate: new Date('2022-01-01'),
          },
        ],
      };

      const savedProfile = {
        id: 1,
        userId,
        firstName: 'John',
        lastName: 'Doe',
        skills: [],
        experience: [],
      };

      mockProfileRepository.findOneBy.mockResolvedValue(null);
      mockProfileRepository.create.mockReturnValue(savedProfile);
      mockProfileRepository.save.mockResolvedValue(savedProfile);
      mockSkillRepository.create.mockImplementation((data) => data);
      mockExperienceRepository.create.mockImplementation((data) => data);
      mockProfileRepository.findOne.mockResolvedValue(savedProfile);

      const result = await service.create(userId, createDto);

      expect(profileRepository.findOneBy).toHaveBeenCalledWith({ userId });
      expect(profileRepository.create).toHaveBeenCalled();
      expect(profileRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if profile already exists', async () => {
      const userId = 1;
      const existingProfile = { id: 1, userId };

      mockProfileRepository.findOneBy.mockResolvedValue(existingProfile);

      await expect(service.create(userId, {} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on save error', async () => {
      const userId = 1;
      const createDto = { firstName: 'John', lastName: 'Doe' };

      mockProfileRepository.findOneBy.mockResolvedValue(null);
      mockProfileRepository.create.mockReturnValue({});
      mockProfileRepository.save.mockRejectedValue(new Error('DB Error'));

      await expect(service.create(userId, createDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updateByUserId', () => {
    it('should update an existing profile', async () => {
      const userId = 1;
      const updateDto = {
        firstName: 'Jane',
        skills: [{ name: 'TypeScript', level: 5 }],
      };

      const existingProfile = {
        id: 1,
        userId,
        firstName: 'John',
        skills: [],
      };

      const updatedProfile = {
        ...existingProfile,
        firstName: 'Jane',
      };

      mockProfileRepository.findOneBy.mockResolvedValue(existingProfile);
      mockProfileRepository.merge.mockImplementation((target, source) => {
        Object.assign(target, source);
        return target;
      });
      mockSkillRepository.delete.mockResolvedValue({});
      mockSkillRepository.create.mockImplementation((data) => data);
      mockProfileRepository.save.mockResolvedValue(updatedProfile);
      mockProfileRepository.findOne.mockResolvedValue(updatedProfile);

      const result = await service.updateByUserId(userId, updateDto);

      expect(profileRepository.findOneBy).toHaveBeenCalledWith({ userId });
      expect(profileRepository.merge).toHaveBeenCalled();
      expect(profileRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if profile does not exist', async () => {
      mockProfileRepository.findOneBy.mockResolvedValue(null);

      await expect(service.updateByUserId(999, {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle skills and experience updates', async () => {
      const userId = 1;
      const updateDto = {
        skills: [{ name: 'React', level: 4 }],
        experience: [
          {
            company: 'New Corp',
            position: 'Senior Dev',
            startDate: new Date(),
          },
        ],
      };

      const existingProfile = { id: 1, userId };

      mockProfileRepository.findOneBy.mockResolvedValue(existingProfile);
      mockProfileRepository.merge.mockReturnValue(existingProfile);
      mockSkillRepository.delete.mockResolvedValue({});
      mockExperienceRepository.delete.mockResolvedValue({});
      mockSkillRepository.create.mockImplementation((data) => data);
      mockExperienceRepository.create.mockImplementation((data) => data);
      mockProfileRepository.save.mockResolvedValue(existingProfile);
      mockProfileRepository.findOne.mockResolvedValue(existingProfile);

      await service.updateByUserId(userId, updateDto);

      expect(skillRepository.delete).toHaveBeenCalled();
      expect(experienceRepository.delete).toHaveBeenCalled();
    });
  });

  describe('deleteProfile', () => {
    it('should delete an existing profile', async () => {
      const userId = 1;
      const profile = { id: 1, userId };

      mockProfileRepository.findOneBy.mockResolvedValue(profile);
      mockProfileRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteProfile(userId);

      expect(profileRepository.findOneBy).toHaveBeenCalledWith({ userId });
      expect(profileRepository.delete).toHaveBeenCalledWith(profile.id);
      expect(result).toEqual({
        success: true,
        message: 'Perfil de aspirante eliminado exitosamente.',
      });
    });

    it('should return failure message if profile not found', async () => {
      mockProfileRepository.findOneBy.mockResolvedValue(null);

      const result = await service.deleteProfile(999);

      expect(result).toEqual({
        success: false,
        message: 'Perfil no encontrado.',
      });
    });

    it('should handle deletion errors gracefully', async () => {
      const userId = 1;
      const profile = { id: 1, userId };

      mockProfileRepository.findOneBy.mockResolvedValue(profile);
      mockProfileRepository.delete.mockRejectedValue(new Error('DB Error'));

      const result = await service.deleteProfile(userId);

      expect(result).toEqual({
        success: false,
        message: 'Error interno al eliminar el perfil.',
      });
    });
  });
});
