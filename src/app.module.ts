import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Ordem } from './ordens/entities/ordem.entity';
import { OrdensModule } from './ordens/ordens.module';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'cliqfy_user',
      password: 'cliqfy_password',
      database: 'cliqfy_db',
      entities: [Ordem, User],
      migrations: [__dirname + '/src/migrations/*.ts'],
      synchronize: false, //enable only in dev
      migrationsRun: true,
    }),
    OrdensModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
