import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Store } from './store.entity';
import { Rating } from '../ratings/rating.entity';
import { CreateStoreDto } from './store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private storesRepo: Repository<Store>,
    @InjectRepository(Rating)
    private ratingsRepo: Repository<Rating>,
  ) {}

  async create(dto: CreateStoreDto) {
    const store = this.storesRepo.create(dto);
    return this.storesRepo.save(store);
  }

  async findAll(query: {
    name?: string;
    address?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    userId?: string;
  }) {
    const qb = this.storesRepo.createQueryBuilder('store');

    if (query.name) qb.andWhere('store.name ILIKE :name', { name: `%${query.name}%` });
    if (query.address) qb.andWhere('store.address ILIKE :address', { address: `%${query.address}%` });

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'DESC';
    qb.orderBy(`store.${sortBy}`, sortOrder);

    const stores = await qb.getMany();

    // Enrich with average rating and user's rating
    const enriched = await Promise.all(
      stores.map(async (store) => {
        const ratings = await this.ratingsRepo.find({ where: { storeId: store.id } });
        const avg = ratings.length
          ? ratings.reduce((s, r) => s + r.value, 0) / ratings.length
          : 0;

        let userRating = null;
        if (query.userId) {
          const ur = await this.ratingsRepo.findOne({
            where: { storeId: store.id, userId: query.userId },
          });
          userRating = ur ? ur.value : null;
        }

        return {
          ...store,
          averageRating: parseFloat(avg.toFixed(2)),
          totalRatings: ratings.length,
          userRating,
        };
      }),
    );

    return enriched;
  }

  async findOne(id: string, userId?: string) {
    const store = await this.storesRepo.findOne({ where: { id } });
    if (!store) throw new NotFoundException('Store not found');

    const ratings = await this.ratingsRepo.find({ where: { storeId: id } });
    const avg = ratings.length
      ? ratings.reduce((s, r) => s + r.value, 0) / ratings.length
      : 0;

    let userRating = null;
    if (userId) {
      const ur = await this.ratingsRepo.findOne({ where: { storeId: id, userId } });
      userRating = ur ? ur.value : null;
    }

    return {
      ...store,
      averageRating: parseFloat(avg.toFixed(2)),
      totalRatings: ratings.length,
      userRating,
    };
  }

  async getOwnerDashboard(ownerId: string) {
    const store = await this.storesRepo.findOne({ where: { ownerId } });
    if (!store) throw new NotFoundException('No store associated with this owner');

    const ratings = await this.ratingsRepo.find({
      where: { storeId: store.id },
      relations: ['user'],
    });

    const avg = ratings.length
      ? ratings.reduce((s, r) => s + r.value, 0) / ratings.length
      : 0;

    const raters = ratings.map((r) => ({
      id: r.userId,
      name: r.user?.name,
      email: r.user?.email,
      rating: r.value,
      ratedAt: r.createdAt,
    }));

    return {
      store,
      averageRating: parseFloat(avg.toFixed(2)),
      totalRatings: ratings.length,
      raters,
    };
  }
}
