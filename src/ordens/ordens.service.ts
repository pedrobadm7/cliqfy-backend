import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ordem, OrdemStatus } from './entities/ordem.entity';

@Injectable()
export class OrdensService {
  constructor(
    @InjectRepository(Ordem)
    private ordensRepository: Repository<Ordem>,
  ) {}

  async create(ordem: Partial<Ordem>): Promise<Ordem> {
    return this.ordensRepository.save(ordem);
  }

  async findAll(): Promise<Ordem[]> {
    return this.ordensRepository.find({
      relations: ['criadoPor', 'responsavel'],
      order: { data_criacao: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Ordem> {
    const ordem = await this.ordensRepository.findOne({
      where: { id },
      relations: ['criadoPor', 'responsavel'],
    });

    if (!ordem) {
      throw new NotFoundException(`Ordem #${id} não encontrada`);
    }

    return ordem;
  }

  async update(id: string, ordem: Partial<Ordem>): Promise<Ordem> {
    await this.ordensRepository.update(id, ordem);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const ordem = await this.findOne(id);
    await this.ordensRepository.remove(ordem);
  }

  async checkIn(ordemId: string, userId: string): Promise<Ordem> {
    const ordem = await this.findOne(ordemId);

    if (ordem.status === OrdemStatus.CONCLUIDA) {
      throw new BadRequestException('Ordem já foi concluída');
    }

    if (ordem.status === OrdemStatus.CANCELADA) {
      throw new BadRequestException('Ordem foi cancelada');
    }

    if (ordem.status === OrdemStatus.EM_ANDAMENTO) {
      throw new BadRequestException('Ordem já está em andamento');
    }

    return this.update(ordemId, {
      status: OrdemStatus.EM_ANDAMENTO,
      responsavel_id: userId,
    });
  }

  async checkOut(ordemId: string, userId: string): Promise<Ordem> {
    const ordem = await this.findOne(ordemId);

    if (ordem.status === OrdemStatus.CONCLUIDA) {
      throw new BadRequestException('Ordem já foi concluída');
    }

    if (ordem.status === OrdemStatus.CANCELADA) {
      throw new BadRequestException('Ordem foi cancelada');
    }

    if (ordem.status !== OrdemStatus.EM_ANDAMENTO) {
      throw new BadRequestException(
        'Ordem precisa estar em andamento para ser concluída',
      );
    }

    if (ordem.responsavel_id !== userId) {
      throw new ForbiddenException(
        'Apenas o responsável pode concluir esta ordem',
      );
    }

    return this.update(ordemId, {
      status: OrdemStatus.CONCLUIDA,
      data_conclusao: new Date(),
    });
  }
}
