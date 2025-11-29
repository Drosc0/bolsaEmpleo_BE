import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    // Inyecta el repositorio de la entidad User
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Usado por la AuthLocalStrategy y el Login
  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  //USADO POR JwtStrategy (necesita solo el ID para validar el token)
  async findOneById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  // Puedes añadir métodos CRUD aquí (create, update, findAll, delete)

  async getApplicantProfile(userId: number): Promise<{
    name: string;
    email: string;
    phone?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
  }> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['aspirantProfile'],
    });

    if (!user || !user.aspirantProfile) {
      throw new Error('Perfil de aspirante no encontrado');
    }

    const profile = user.aspirantProfile;

    return {
      name: `${profile.firstName} ${profile.lastName}`,
      email: user.email,
      phone: profile.phone ?? undefined,
      linkedinUrl: profile.linkedinUrl ?? undefined,
      portfolioUrl: profile.portfolioUrl ?? undefined,
    };
  }

  // ==========================================================
  // MÉTODOS PARA ESTADÍSTICAS
  // ==========================================================
  async countAll(): Promise<number> {
    return this.usersRepository.count();
  }

  async countByRole(role: string): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return this.usersRepository.count({ where: { role: role as any } });
  }

  // async create(userData: Partial<User>): Promise<User> { ... }
}
