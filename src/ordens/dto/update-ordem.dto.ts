import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { OrdemStatus } from '../entities/ordem.entity';
import { CreateOrdemDto } from './create-order.dto';

export class UpdateOrdemDto extends PartialType(CreateOrdemDto) {
  @IsEnum(OrdemStatus)
  @IsOptional()
  status?: OrdemStatus;

  @IsUUID()
  @IsOptional()
  responsavel_id?: string;
}
