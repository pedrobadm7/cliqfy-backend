import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum OrdemStatus {
  ABERTA = 'aberta',
  EM_ANDAMENTO = 'em_andamento',
  CONCLUIDA = 'concluida',
  CANCELADA = 'cancelada',
}

@Entity()
export class Ordem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cliente: string;

  @Column({ type: 'text' })
  descricao: string;

  @Column({
    type: 'enum',
    enum: OrdemStatus,
    default: OrdemStatus.ABERTA,
  })
  status: OrdemStatus;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  data_criacao: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', nullable: true })
  data_atualizacao: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', nullable: true })
  data_conclusao: Date;

  @Column()
  criado_por_id: string;

  @ManyToOne(() => User, (user) => user.ordensCriadas, { eager: false })
  @JoinColumn({ name: 'criado_por_id' })
  criadoPor: User;

  @Column({ type: 'uuid', nullable: true })
  responsavel_id: string;

  @ManyToOne(() => User, (user) => user.ordensResponsavel, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: 'responsavel_id' })
  responsavel: User;
}
