/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClubEntity } from './club.entity';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';

@Injectable()
export class ClubService {
    constructor(
        @InjectRepository(ClubEntity)
        private readonly clubRepository: Repository<ClubEntity>
    ) {}

    async findAll(): Promise<ClubEntity[]> {
        return await this.clubRepository.find({
            relations: {
                socios: true
            }
        });
    }

    async findOne(id: string): Promise<ClubEntity> {

        const club: ClubEntity = await this.clubRepository.findOne({
            where: {id},
            relations: {
                socios:true
            }
        });

        if (!club) {
            throw new BusinessLogicException("No se encontro ese club", BusinessError.NOT_FOUND)
        }

        return club;
    }

    async create(club: ClubEntity): Promise<ClubEntity> {

        if (club.descripcion.length > 100) {
            throw new BusinessLogicException("La descripción supera la longitud permitida de 100", BusinessError.PRECONDITION_FAILED);
        }

        return await this.clubRepository.save(club);
    }

    async update(id: string, club: ClubEntity): Promise<ClubEntity> {

        const storedClub: ClubEntity = await this.clubRepository.findOne({
            where: {id}
        });

        if (!storedClub) {
            throw new BusinessLogicException("No se encontro ese club", BusinessError.NOT_FOUND);
        }

        if (club.descripcion.length > 100) {
            throw new BusinessLogicException("La descripción supera la longitud permitida de 100", BusinessError.PRECONDITION_FAILED);
        }

        return await this.clubRepository.save({ ...storedClub, ...club });

    }

    async delete(id: string) {
        const storedClub: ClubEntity = await this.clubRepository.findOne({
            where: {id}
        });

        if (!storedClub) {
            throw new BusinessLogicException("No se encontro ese club", BusinessError.NOT_FOUND);
        }

        await this.clubRepository.remove(storedClub);

    }
}
