import { Exclude, Expose } from 'class-transformer';
import { UserRole } from '../entities/user.entity';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  nome: string;

  @Expose()
  email: string;

  @Expose()
  role: UserRole;

  @Expose()
  ativo: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
