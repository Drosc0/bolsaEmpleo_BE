import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { AspirantProfile } from './aspirant-profile.entity';

@Entity('experience_items')
export class ExperienceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  title: string;

  @Column({ length: 100 })
  company: string;

  @Column({ type: 'date' })
  startDate: string; // Usamos string/date para manejar formatos de fecha (ISO 8601)

  @Column({ type: 'date', nullable: true })
  endDate: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  // RELACIONES

  // Clave foránea que se usó en ProfileService para el create/update
  @Column()
  profileId: number;

  // Relación N:1 con el perfil del aspirante
  @ManyToOne(() => AspirantProfile, (profile) => profile.experience, {
    onDelete: 'CASCADE', // Si el perfil se elimina, se elimina la experiencia
  })
  @JoinColumn({ name: 'profileId' })
  profile: AspirantProfile;
}
