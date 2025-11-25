import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { Public } from './decorators/public.decorator';

// Definir la interfaz de respuesta para coincidir con el cliente Flutter
interface AuthClientResponse {
  token: string;
  userId: number;
  role: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Ruta para registrar un nuevo usuario (Aspirante o Empresa).
   * POST /auth/register
   * MODIFICADO: Ahora devuelve el token y los datos de sesión tras el registro.
   */
  @Public() // excluye esta ruta de la protección JWT global
  @Post('register')
  @HttpCode(HttpStatus.CREATED) // Mantenemos 201 Created para el registro
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<AuthClientResponse> {
    // El servicio ahora devuelve { token, userId, role }
    return this.authService.register(
      registerDto,
    ) as Promise<AuthClientResponse>;
  }

  /**
   * Ruta para iniciar sesión.
   * POST /auth/login
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK) // Asegura que la respuesta sea 200 OK
  async login(@Body() loginDto: LoginDto): Promise<AuthClientResponse> {
    // El servicio ahora devuelve { token, userId, role }
    return this.authService.login(loginDto) as Promise<AuthClientResponse>;
  }
}
