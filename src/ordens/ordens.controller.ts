import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Ordem } from './entities/ordem.entity';
import { OrdensService } from './ordens.service';

@Controller('ordens')
export class OrdensController {
  constructor(private readonly ordensService: OrdensService) {}

  @Post()
  create(@Body() ordem: Partial<Ordem>) {
    return this.ordensService.create(ordem);
  }

  @Get()
  findAll() {
    return this.ordensService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordensService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() ordem: Partial<Ordem>) {
    return this.ordensService.update(id, ordem);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordensService.remove(id);
  }
}
