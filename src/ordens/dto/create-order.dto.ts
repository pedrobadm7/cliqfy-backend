import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { OrdemStatus } from '../entities/ordem.entity';

export class CreateOrdemDto {
  @IsString()
  @IsNotEmpty()
  cliente: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsEnum(OrdemStatus)
  @IsOptional()
  status?: OrdemStatus;

  @IsUUID()
  @IsNotEmpty()
  criado_por_id: string;

  @IsUUID()
  @IsOptional()
  responsavel_id?: string;
}
