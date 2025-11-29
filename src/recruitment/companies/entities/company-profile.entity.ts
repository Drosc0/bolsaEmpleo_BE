import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../../user/user.entity';
import { JobOffer } from '../job-offers/job-offer.entity';

@Entity('company_profiles')
export class CompanyProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: true })
  companyName: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logoUrl: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string | null;

  // 1. Relación 1:1 con el Usuario (Foreign Key)
  @Column({ unique: true })
  userId: number;

  @OneToOne(() => User, (user) => user.companyProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // 2. Relación 1:N con las Ofertas de Trabajo
  @OneToMany(() => JobOffer, (offer) => offer.company)
  offers: JobOffer[];
}
