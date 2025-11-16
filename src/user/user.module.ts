import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Repositorio de User
  ],
  providers: [
    UserService, // Servicio con lógica de negocio
  ],
  controllers: [
    UserController, // Controlador con los endpoints
  ],
  exports: [
    TypeOrmModule, // Exporta el repositorio para otros módulos
    UserService, // Exporta el servicio si otros módulos lo necesitan
  ],
})
export class UserModule {}
