/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SocioEntity } from './socio.entity';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';

@Injectable()
export class SocioService {
    constructor(
        @InjectRepository(SocioEntity)
        private readonly socioRepository: Repository<SocioEntity>
    ) {}

    async findAll(): Promise<SocioEntity[]> {
        return await this.socioRepository.find({
            relations: {
                clubs: true
            }
        });
    }

    async findOne(id: string): Promise<SocioEntity> {
        const socio: SocioEntity = await this.socioRepository.findOne({
            where: {id},
            relations: {
                clubs: true
            }
        });

        if (!socio) {
            throw new BusinessLogicException("No se encontro ese socio", BusinessError.NOT_FOUND);
        }

        return socio;
    }


    async create(socio: SocioEntity): Promise<SocioEntity> {

        if (!socio.correo.includes('@')) {
            throw new BusinessLogicException("El correo no contiene @", BusinessError.PRECONDITION_FAILED);
        }

        return await this.socioRepository.save(socio);
    }

    async update(id: string, socio: SocioEntity): Promise<SocioEntity> {
        const storedSocio: SocioEntity = await this.socioRepository.findOne({
            where: {id}
        });

        if (!storedSocio) {
            throw new BusinessLogicException("No se encontro ese socio", BusinessError.NOT_FOUND);
        }

        if (!socio.correo.includes('@')) {
            throw new BusinessLogicException("El correo no contiene @", BusinessError.PRECONDITION_FAILED);
        }

        return await this.socioRepository.save({...storedSocio, ...socio});
    }

    async delete(id: string) {
        const storedSocio: SocioEntity = await this.socioRepository.findOne({
            where: {id}
        });

        if (!storedSocio) {
            throw new BusinessLogicException("No se encontro ese socio", BusinessError.NOT_FOUND);
        }

        await this.socioRepository.remove(storedSocio);
    }
}
