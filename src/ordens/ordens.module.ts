import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ordem } from './entities/ordem.entity';
import { OrdensController } from './ordens.controller';
import { OrdensService } from './ordens.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ordem])],
  controllers: [OrdensController],
  providers: [OrdensService],
})
export class OrdensModule {}
