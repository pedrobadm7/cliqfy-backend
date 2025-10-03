import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Ordem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cliente: string;

  @Column()
  descricao: string;

  @Column({ default: 'aberta' })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  data_criacao: Date;

  @Column({ type: 'timestamp', nullable: true })
  data_conclusao: Date;
}
