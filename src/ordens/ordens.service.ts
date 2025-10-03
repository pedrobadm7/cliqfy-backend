import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ordem } from './entities/ordem.entity';

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
    return this.ordensRepository.find();
  }

  async findOne(id: number): Promise<Ordem> {
    return this.ordensRepository.findOneBy({ id }) as Promise<Ordem>;
  }

  async update(id: number, ordem: Partial<Ordem>): Promise<Ordem> {
    await this.ordensRepository.update(id, ordem);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.ordensRepository.delete(id);
  }
}
