import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './store.dto';
import { Roles, RolesGuard } from '../common/roles.guard';
import { UserRole } from '../users/user.entity';

@Controller('stores')
@UseGuards(AuthGuard('jwt'))
export class StoresController {
  constructor(private storesService: StoresService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateStoreDto) {
    return this.storesService.create(dto);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('name') name?: string,
    @Query('address') address?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.storesService.findAll({ name, address, sortBy, sortOrder, userId: req.user.id });
  }

  @Get('owner-dashboard')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STORE_OWNER)
  getOwnerDashboard(@Request() req) {
    return this.storesService.getOwnerDashboard(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.storesService.findOne(id, req.user.id);
  }
}
