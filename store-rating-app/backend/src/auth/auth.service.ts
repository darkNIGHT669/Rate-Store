import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../users/user.entity';
import { RegisterDto, LoginDto, UpdatePasswordDto, CreateUserDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({ ...dto, password: hashed, role: UserRole.USER });
    await this.usersRepo.save(user);
    const { password, ...result } = user;
    return result;
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.usersRepo.update(userId, { password: hashed });
    return { message: 'Password updated successfully' };
  }

  async createUser(dto: CreateUserDto) {
    const exists = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({ ...dto, password: hashed });
    await this.usersRepo.save(user);
    const { password, ...result } = user;
    return result;
  }

  async seedAdmin() {
    const exists = await this.usersRepo.findOne({ where: { email: 'admin@platform.com' } });
    if (!exists) {
      const hashed = await bcrypt.hash('Admin@123', 10);
      await this.usersRepo.save(
        this.usersRepo.create({
          name: 'System Administrator Account',
          email: 'admin@platform.com',
          password: hashed,
          role: UserRole.ADMIN,
          address: '123 Admin Street, Platform City',
        }),
      );
      console.log('Default admin seeded: admin@platform.com / Admin@123');
    }
  }
}
