import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../user/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UserRole } from '../user/user.entity';
import { ProfileService } from '../recruitment/aspirants/profile/profile.service';
import { CompanyProfileService } from '../recruitment/companies/profile/company-profile.service';

// Definir la interfaz de respuesta que incluye los campos necesarios para el frontend
interface AuthResult {
  token: string;
  userId: number; // Asumiendo que el ID es un número (serial)
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly aspirantProfileService: ProfileService,
    private readonly companyProfileService: CompanyProfileService,
  ) {}

  //REGISTRO (MODIFICADO para pasar email y companyName al perfil)
  async register(registerDto: RegisterDto): Promise<AuthResult> {
    const { email, password, role } = registerDto;

    // 1. Verificar si el usuario ya existe
    const existingUser = await this.usersRepository.findOneBy({ email });
    if (existingUser) {
      throw new BadRequestException(
        'El correo electrónico ya está registrado.',
      );
    }

    // 2. Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Crear y guardar el usuario
    const newUser = this.usersRepository.create({
      email,
      password: hashedPassword,
      role,
    });

    try {
      const savedUser = await this.usersRepository.save(newUser);

      // Crear el perfil asociado según el rol
      if (savedUser.role === UserRole.ASPIRANTE) {
        // Llama al servicio para crear una entrada de perfil por defecto
        await this.aspirantProfileService.createDefault(savedUser);
      } else if (savedUser.role === UserRole.EMPRESA) {
        // Pasar el email y el nombre de la empresa
        await this.companyProfileService.createDefault({
          user: savedUser,
          email: savedUser.email,
          companyName: registerDto.companyName || savedUser.email, // El DTO debe asegurarse de que este campo exista
        });
      }

      // 4. Generar el token JWT y devolver la respuesta
      const payload = {
        email: savedUser.email,
        sub: savedUser.id,
        role: savedUser.role,
      };

      return {
        token: this.jwtService.sign(payload),
        userId: savedUser.id,
        role: savedUser.role,
      };
    } catch (error: any) {
      // Manejo de errores de BD/TypeORM
      console.error('⚠️ [Error Crítico de BD en Registro]', error);

      let errorMessage: string =
        'Fallo en la creación de usuario. Revise las restricciones de la BD.';

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error && error.detail) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        errorMessage = error.detail;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      } else if (error && error.message) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        errorMessage = error.message;
      }

      throw new BadRequestException(
        `Fallo en la creación de usuario: ${errorMessage}`,
      );
    }
  }

  // --- LOGIN (MODIFICADO para devolver userId y role) ---
  async login(loginDto: LoginDto): Promise<AuthResult> {
    const { email, password } = loginDto;

    // 1. Buscar el usuario
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    // 2. Comparar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    // 3. Generar el token JWT
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    return {
      token: this.jwtService.sign(payload),
      userId: user.id, // Devolver el ID
      role: user.role, // Devolver el rol
    };
  }

  // Utilizado por JwtStrategy: busca un usuario basándose únicamente en el ID (sub)
  async getUserByIdForJwt(id: number): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      return null; // Usuario no encontrado
    }

    // Devolver el usuario excluyendo la contraseña
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result as User;
  }

  async validateLocalUser(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result as User;
  }
}
