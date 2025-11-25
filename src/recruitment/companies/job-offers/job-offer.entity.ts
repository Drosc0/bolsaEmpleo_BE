import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CompanyProfile } from '../entities/company-profile.entity';
import { Application } from 'src/recruitment/applications/entities/application.entity';
// import { Application } from 'src/recruitment/applicants/entities/application.entity'; // La crearemos después

@Entity('job_offers')
export class JobOffer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 50 })
  location: string; // Ej: Remoto, Madrid, Híbrido

  @Column({ length: 50 })
  salaryRange: string; // Ej: 30k - 40k EUR

  @Column({ length: 20, default: 'Abierta' })
  status: string; // Ej: Abierta, Cerrada, Pausada

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  //RELACIONES

  // Relación N:1: Muchas ofertas pertenecen a una empresa
  @ManyToOne(() => CompanyProfile, (company) => company.offers)
  company: CompanyProfile;

  @Column() // Clave foránea
  companyId: number;

  // 2. Relación 1:N con las postulaciones (CORRECCIÓN CLAVE)
  @OneToMany(() => Application, (application) => application.jobOffer)
  applications: Application[];
}
