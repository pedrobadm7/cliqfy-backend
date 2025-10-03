import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { Ordem } from './ordens/entities/ordem.entity';
import { OrdensModule } from './ordens/ordens.module';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'cliqfy_user',
      password: 'cliqfy_password',
      database: 'cliqfy_db',
      entities: [User, Ordem],
      migrations: ['dist/database/migrations/*.js'],
      synchronize: false,
      migrationsRun: true,
    }),
    AuthModule,
    UsersModule,
    OrdensModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
