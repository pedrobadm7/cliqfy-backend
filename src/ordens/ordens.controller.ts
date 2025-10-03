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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateOrdemDto } from './dto/create-order.dto';
import { UpdateOrdemDto } from './dto/update-ordem.dto';
import { Ordem } from './entities/ordem.entity';
import { OrdensService } from './ordens.service';

@Controller('ordens')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdensController {
  constructor(private readonly ordensService: OrdensService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  create(
    @Body() createOrdemDto: CreateOrdemDto,
    @CurrentUser() user: User,
  ): Promise<Ordem> {
    return this.ordensService.create({
      ...createOrdemDto,
      criado_por_id: user.id,
    });
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.VIEWER)
  findAll(): Promise<Ordem[]> {
    return this.ordensService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.VIEWER)
  findOne(@Param('id') id: string): Promise<Ordem> {
    return this.ordensService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  update(
    @Param('id') id: string,
    @Body() updateOrdemDto: UpdateOrdemDto,
  ): Promise<Ordem> {
    return this.ordensService.update(id, updateOrdemDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string): Promise<void> {
    return this.ordensService.remove(id);
  }

  @Post(':id/check-in')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  checkIn(@Param('id') id: string, @CurrentUser() user: User): Promise<Ordem> {
    return this.ordensService.checkIn(id, user.id);
  }

  @Post(':id/check-out')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  checkOut(@Param('id') id: string, @CurrentUser() user: User): Promise<Ordem> {
    return this.ordensService.checkOut(id, user.id);
  }

  @Get('reports/daily')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  async getDailyReport() {
    const response = await fetch('http://localhost:5062/reports/daily');
    const report = await response.json();
    return report;
  }
}
