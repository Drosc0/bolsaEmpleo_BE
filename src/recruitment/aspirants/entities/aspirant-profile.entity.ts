import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ExperienceItem } from './experience-item.entity';
import { SkillItem } from './skill-item.entity';
import { User } from '../../../user/user.entity';
import { Application } from '../../applications/entities/application.entity';

@Entity('aspirant_profiles')
export class AspirantProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName?: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  linkedinUrl?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  portfolioUrl?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  currentJobTitle?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  photoUrl?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cvUrl?: string;

  // RELACIONES
  @Column({ unique: true })
  userId: number;

  @OneToOne(() => User, (user) => user.aspirantProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => SkillItem, (skill) => skill.profile, {
    cascade: ['insert', 'update'],
    onDelete: 'CASCADE',
  })
  skills: SkillItem[];

  @OneToMany(() => ExperienceItem, (experience) => experience.profile, {
    cascade: ['insert', 'update'],
    onDelete: 'CASCADE',
  })
  experience: ExperienceItem[];

  @OneToMany(() => Application, (application) => application.aspirantProfile)
  applications: Application[];
}
