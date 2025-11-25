import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { AspirantProfile } from './aspirant-profile.entity';

// Enum para definir niveles de habilidad de forma controlada
export enum SkillLevel {
  NOVICE = 'Novice',
  BASIC = 'Básico',
  INTERMEDIATE = 'Intermedio',
  ADVANCED = 'Avanzado',
  EXPERT = 'Experto',
}

@Entity('skill_items')
// Índice compuesto para asegurar que una habilidad es única por perfil
@Index(['profileId', 'skillName'], { unique: true })
export class SkillItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  skillName: string;

  @Column({
    type: 'enum',
    enum: SkillLevel,
    default: SkillLevel.BASIC,
  })
  level: SkillLevel;

  // RELACIONES

  // Clave foránea que se usó en ProfileService para el create/update
  @Column()
  profileId: number;

  // Relación N:1 con el perfil del aspirante
  @ManyToOne(() => AspirantProfile, (profile) => profile.skills, {
    onDelete: 'CASCADE', // Si el perfil se elimina, se elimina la habilidad
  })
  @JoinColumn({ name: 'profileId' })
  profile: AspirantProfile;
}
