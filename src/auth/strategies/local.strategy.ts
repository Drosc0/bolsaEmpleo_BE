import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService } from '../auth.service';
import { User } from '../../user/user.entity'; // Asegúrate de que esta ruta sea correcta

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      // Usamos 'email' en lugar de 'username' por defecto para req.body
      usernameField: 'email',
    });
  }

  /**
   * Método llamado por Passport para verificar las credenciales.
   * @param email El valor del campo 'email' de la solicitud.
   * @param password La contraseña proporcionada.
   * @returns El objeto User si las credenciales son válidas.
   */
  async validate(email: string, password: string): Promise<User> {
    //CORRECCIÓN: Llamada al método renombrado en AuthService
    const user = await this.authService.validateLocalUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Credenciales de acceso incorrectas.');
    }

    // Retorna el objeto user.
    return user;
  }
}
