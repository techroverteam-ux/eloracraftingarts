import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, CreateClientDto } from './dto/users.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/schemas';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: UserRole,
    @Query('isActive') isActive?: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const activeFilter = isActive ? isActive === 'true' : undefined;

    return this.usersService.findAll(pageNum, limitNum, role, activeFilter);
  }

  @Get('rookies')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getRookies() {
    return this.usersService.getRookies();
  }

  @Get('installers')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getInstallers() {
    return this.usersService.getInstallers();
  }

  @Get('admins')
  @Roles(UserRole.SUPER_ADMIN)
  getAdmins() {
    return this.usersService.getAdmins();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Patch(':id/activate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  activate(@Param('id') id: string) {
    return this.usersService.activate(id);
  }

  // Client management endpoints
  @Post('clients')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  createClient(@Body() createClientDto: CreateClientDto) {
    return this.usersService.createClient(createClientDto);
  }

  @Get('clients/list')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getClients(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    return this.usersService.getClients(pageNum, limitNum);
  }

  @Get('clients/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getClient(@Param('id') id: string) {
    return this.usersService.getClient(id);
  }
}