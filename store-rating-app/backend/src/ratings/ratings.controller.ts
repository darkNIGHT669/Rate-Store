import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RatingsService } from './ratings.service';
import { IsNumber, IsUUID, Min, Max } from 'class-validator';

class RatingDto {
  @IsUUID()
  storeId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  value: number;
}

@Controller('ratings')
@UseGuards(AuthGuard('jwt'))
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @Post()
  submit(@Request() req, @Body() dto: RatingDto) {
    return this.ratingsService.submitRating(req.user.id, dto.storeId, dto.value);
  }
}
