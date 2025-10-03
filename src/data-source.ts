import { DataSource } from 'typeorm';
import { Ordem } from './ordens/entities/ordem.entity';
import { User } from './users/entities/user.entity';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'cliqfy_user',
  password: 'cliqfy_password',
  database: 'cliqfy_db',
  entities: [Ordem, User],
  migrations: ['src/database/migrations/**/*.ts'],
  synchronize: false,
});
