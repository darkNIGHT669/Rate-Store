import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { User, UserRole } from './user.entity';
import { Store } from '../stores/store.entity';
import { Rating } from '../ratings/rating.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Store)
    private storesRepo: Repository<Store>,
    @InjectRepository(Rating)
    private ratingsRepo: Repository<Rating>,
  ) {}

  async findAll(query: {
    name?: string;
    email?: string;
    address?: string;
    role?: UserRole;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) {
    const where: FindOptionsWhere<User> = {};
    if (query.name) where.name = Like(`%${query.name}%`);
    if (query.email) where.email = Like(`%${query.email}%`);
    if (query.address) where.address = Like(`%${query.address}%`);
    if (query.role) where.role = query.role;

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'DESC';

    const users = await this.usersRepo.find({
      where,
      order: { [sortBy]: sortOrder },
      select: ['id', 'name', 'email', 'address', 'role', 'createdAt'],
    });
    return users;
  }

  async findOne(id: string) {
    const user = await this.usersRepo.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'address', 'role', 'createdAt'],
    });
    if (!user) throw new NotFoundException('User not found');

    // If store owner, find their store rating
    if (user.role === UserRole.STORE_OWNER) {
      const store = await this.storesRepo.findOne({ where: { ownerId: id } });
      if (store) {
        const ratings = await this.ratingsRepo.find({ where: { storeId: store.id } });
        const avg = ratings.length
          ? ratings.reduce((s, r) => s + r.value, 0) / ratings.length
          : 0;
        return { ...user, storeRating: parseFloat(avg.toFixed(2)), storeId: store.id };
      }
    }
    return user;
  }

  async getDashboardStats() {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      this.usersRepo.count(),
      this.storesRepo.count(),
      this.ratingsRepo.count(),
    ]);
    return { totalUsers, totalStores, totalRatings };
  }
}
