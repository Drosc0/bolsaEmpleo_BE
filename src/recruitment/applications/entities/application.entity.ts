import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { AspirantProfile } from '../../aspirants/entities/aspirant-profile.entity';
import { JobOffer } from '../../companies/job-offers/job-offer.entity';

// Enum para manejar el estado de la postulación
export enum ApplicationStatus {
  // eslint-disable-next-line prettier/prettier
  PENDING = 'PENDING',     // Inicializado como PENDING (para el default)
  APPLIED = 'APPLIED', // Postulado
  IN_REVIEW = 'IN_REVIEW', // En Revisión
  INTERVIEW = 'INTERVIEW', // Entrevista
  HIRED = 'HIRED', // Contratado
  REJECTED = 'REJECTED', // Rechazado
}

@Entity('applications')
// Índice compuesto para asegurar que un aspirante solo se postule una vez a una oferta
@Index(['aspirantId', 'jobOfferId'], { unique: true })
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING, // Estandarizamos el default a PENDING
  })
  status: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  coverLetter: string | null; // Carta de presentación (opcional)

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  appliedAt: Date;

  @Column({ type: 'text', nullable: true })
  internalNote: string | null;

  // RELACIONES N:1

  // 1. Relación con el Perfil del Aspirante
  @ManyToOne(() => AspirantProfile, (profile) => profile.applications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'aspirantId' })
  aspirantProfile: AspirantProfile;

  @Column() // Clave foránea del Aspirante
  aspirantId: number;

  // 2. Relación con la Oferta de Empleo
  @ManyToOne(() => JobOffer, (offer) => offer.applications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'jobOfferId' })
  jobOffer: JobOffer;

  @Column() // Clave foránea de la Oferta
  jobOfferId: number;
}
