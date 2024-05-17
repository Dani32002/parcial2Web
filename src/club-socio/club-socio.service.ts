/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClubEntity } from '../club/club.entity';
import { SocioEntity } from '../socio/socio.entity';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';

@Injectable()
export class ClubSocioService {
    constructor(
        @InjectRepository(ClubEntity)
        private readonly clubRepository: Repository<ClubEntity>,
        @InjectRepository(SocioEntity)
        private readonly socioRepository: Repository<SocioEntity>
    ) {}

    async addMemberToClub(idClub: string, idSocio: string): Promise<ClubEntity> {
        const club: ClubEntity = await this.clubRepository.findOne({
            where: {id: idClub},
            relations: {
                socios: true
            }
        });

        if (!club) {
            throw new BusinessLogicException("No se encontro ese club", BusinessError.NOT_FOUND);
        }

        const socio: SocioEntity  = await this.socioRepository.findOne({
            where: {id: idSocio}
        });

        if (!socio) {
            throw new BusinessLogicException("No se encontro ese socio", BusinessError.NOT_FOUND);
        }

        club.socios = [...club.socios, socio];

        return await this.clubRepository.save(club);
    }

    async findMembersFromClub(idClub: string): Promise<SocioEntity[]> {
        const club: ClubEntity = await this.clubRepository.findOne({
            where: {id: idClub},
            relations: {
                socios: true
            }
        });

        if (!club) {
            throw new BusinessLogicException("No se encontro ese club", BusinessError.NOT_FOUND);
        }

        return club.socios;
    }

    async findMemberFromClub(idClub: string, idSocio: string): Promise<SocioEntity> {
        const club: ClubEntity = await this.clubRepository.findOne({
            where: {id: idClub},
            relations: {
                socios: true
            }
        });

        if (!club) {
            throw new BusinessLogicException("No se encontro ese club", BusinessError.NOT_FOUND);
        }

        const socio: SocioEntity  = await this.socioRepository.findOne({
            where: {id: idSocio}
        });

        if (!socio) {
            throw new BusinessLogicException("No se encontro ese socio", BusinessError.NOT_FOUND);
        }

        const relatedSocio: SocioEntity = club.socios.find(e => e.id === socio.id);

        if (!relatedSocio) {
            throw new BusinessLogicException("El club no esta relacionado con el socio", BusinessError.PRECONDITION_FAILED);
        }

        return socio;
    }

    async updateMembersFromClub(idClub: string, socios: SocioEntity[]): Promise<ClubEntity> {
        const club: ClubEntity = await this.clubRepository.findOne({
            where: {id: idClub},
            relations: {
                socios: true
            }
        });

        if (!club) {
            throw new BusinessLogicException("No se encontro ese club", BusinessError.NOT_FOUND);
        }

        for (let i = 0; i < socios.length; i++) {
            const socio: SocioEntity = await this.socioRepository.findOne({
                where: { id: socios[i].id }
            });

            if (!socio) {
                throw new BusinessLogicException("No se encontro uno de los socios", BusinessError.NOT_FOUND);
            }
        }

        club.socios = socios;

        return await this.clubRepository.save(club);
    }

    async deleteMemberFromClub(idClub: string, idSocio: string) {
        const club: ClubEntity = await this.clubRepository.findOne({
            where: {id: idClub},
            relations: {
                socios: true
            }
        });

        if (!club) {
            throw new BusinessLogicException("No se encontro ese club", BusinessError.NOT_FOUND);
        }

        const socio: SocioEntity  = await this.socioRepository.findOne({
            where: {id: idSocio}
        });

        if (!socio) {
            throw new BusinessLogicException("No se encontro ese socio", BusinessError.NOT_FOUND);
        }

        const relatedSocio: SocioEntity = club.socios.find(e => e.id === socio.id);

        if (!relatedSocio) {
            throw new BusinessLogicException("El club no esta relacionado con el socio", BusinessError.PRECONDITION_FAILED);
        }

        club.socios = club.socios.filter(e => e.id !== socio.id);

        await this.clubRepository.save(club);
    }
}
