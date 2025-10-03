import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/users/entities/user.entity';
import { Ordem } from './entities/ordem.entity';
import { OrdensService } from './ordens.service';

@Controller('ordens')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdensController {
  constructor(private readonly ordensService: OrdensService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  create(@Body() ordem: Partial<Ordem>) {
    return this.ordensService.create(ordem);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.VIEWER)
  findAll() {
    return this.ordensService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.VIEWER)
  findOne(@Param('id') id: string) {
    return this.ordensService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  update(@Param('id') id: string, @Body() ordem: Partial<Ordem>) {
    return this.ordensService.update(id, ordem);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.ordensService.remove(id);
  }
}
