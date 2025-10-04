import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Ordem } from '../../ordens/entities/ordem.entity';

export enum UserRole {
  ADMIN = 'admin',
  AGENT = 'agent',
  VIEWER = 'viewer',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  senha: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VIEWER,
  })
  role: UserRole;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Ordem, (ordem) => ordem.criadoPor)
  ordensCriadas: Ordem[];

  @OneToMany(() => Ordem, (ordem) => ordem.responsavel)
  ordensResponsavel: Ordem[];
}
