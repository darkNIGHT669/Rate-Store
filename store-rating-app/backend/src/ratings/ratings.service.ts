import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './rating.entity';

export class SubmitRatingDto {
  storeId: string;
  value: number;
}
 
@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private ratingsRepo: Repository<Rating>,
  ) {}

  async submitRating(userId: string, storeId: string, value: number) {
    if (value < 1 || value > 5) throw new BadRequestException('Rating must be between 1 and 5');

    const existing = await this.ratingsRepo.findOne({ where: { userId, storeId } });

    if (existing) {
      existing.value = value;
      return this.ratingsRepo.save(existing);
    }

    const rating = this.ratingsRepo.create({ userId, storeId, value });
    return this.ratingsRepo.save(rating);
  }
}
