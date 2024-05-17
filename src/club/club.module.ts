/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ClubEntity } from './club.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubService } from './club.service';

@Module({
    imports: [TypeOrmModule.forFeature([ClubEntity])],
    providers: [ClubService],
})
export class ClubModule {}
