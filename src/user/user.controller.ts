import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('applicant')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * GET /applicant/:userId/profile
   * Devuelve el perfil básico del aspirante (nombre completo, email, etc.)
   */

  @Get(':userId/profile')
  async getProfile(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const profile = await this.userService.getApplicantProfile(userId);
      return profile;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Perfil no encontrado';
      throw new NotFoundException(message);
    }
  }
}
