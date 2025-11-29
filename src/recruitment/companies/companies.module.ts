import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Importar el nuevo módulo de Usuario
import { UserModule } from '../../user/user.module';
import { ApplicationsModule } from '../applications/applications.module';

// Perfil de la Empresa
import { CompanyProfile } from './entities/company-profile.entity';
import { CompanyProfileController } from './profile/company-profile.controller';
import { JobOffersController } from './job-offers/job-offers.controller';
import { CompanyProfileService } from './profile/company-profile.service';
import { JobOffersService } from './job-offers/job-offers.service';
import { JobOffer } from './job-offers/job-offer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyProfile, JobOffer]),
    UserModule,
    ApplicationsModule,
  ],
  controllers: [CompanyProfileController, JobOffersController],
  providers: [CompanyProfileService, JobOffersService],
  exports: [CompanyProfileService, JobOffersService, TypeOrmModule],
})
export class CompaniesModule {}
