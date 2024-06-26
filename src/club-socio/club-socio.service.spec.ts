/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { ClubSocioService } from './club-socio.service';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { SocioEntity } from '../socio/socio.entity';
import { ClubEntity } from '../club/club.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('ClubSocioService', () => {
  let service: ClubSocioService;
  let clubRepository: Repository<ClubEntity>;
  let socioRepository: Repository<SocioEntity>;
  let sociosList: SocioEntity[];
  let club: ClubEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClubSocioService],
    }).compile();

    service = module.get<ClubSocioService>(ClubSocioService);
    socioRepository = module.get<Repository<SocioEntity>>(getRepositoryToken(SocioEntity));
    clubRepository = module.get<Repository<ClubEntity>>(getRepositoryToken(ClubEntity));

    await seedDatabase();
  });

  const seedDatabase = async () => {
    clubRepository.clear();
    socioRepository.clear();

    sociosList = [];
    for (let i = 0; i < 5; i++) {
      const socio: SocioEntity = await socioRepository.save({
        nombre: faker.internet.userName(),
        correo: faker.internet.email(),
        fecha_nacimiento: faker.date.past()
      });
      sociosList.push(socio);
    }

    club = await clubRepository.save({
      nombre: faker.company.name(),
      descripcion: faker.lorem.sentence(),
      fecha_fundacion: faker.date.past(),
      imagen: faker.image.url(),
      socios: sociosList
    });
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Add member to club should persist a member in the the clubs socios array', async () => {
    const socio: SocioEntity = await socioRepository.save({
      nombre: faker.internet.userName(),
      correo: faker.internet.email(),
      fecha_nacimiento: faker.date.past()
    });

    const returnedClub: ClubEntity = await service.addMemberToClub(club.id, socio.id);
    expect(returnedClub).not.toBeNull();

    const storedClub: ClubEntity = await clubRepository.findOne({
      where: {id: club.id},
      relations: {
        socios: true
      }
    });
    expect(storedClub).not.toBeNull();

    expect(returnedClub.nombre).toEqual(storedClub.nombre);
    expect(returnedClub.descripcion).toEqual(storedClub.descripcion);
    expect(returnedClub.fecha_fundacion).toEqual(storedClub.fecha_fundacion);
    expect(returnedClub.imagen).toEqual(storedClub.imagen);

    expect(returnedClub.nombre).toEqual(club.nombre);
    expect(returnedClub.descripcion).toEqual(club.descripcion);
    expect(returnedClub.fecha_fundacion).toEqual(club.fecha_fundacion);
    expect(returnedClub.imagen).toEqual(club.imagen);

    const storedSocio: SocioEntity = storedClub.socios.find(e => e.id === socio.id);
    expect(storedSocio).not.toBeUndefined();

    expect(storedSocio.nombre).toEqual(socio.nombre);
    expect(storedSocio.fecha_nacimiento).toEqual(socio.fecha_nacimiento);
    expect(storedSocio.correo).toEqual(socio.correo);
  });

  it('Adding a member to a not existing club should raise an exception', async () => {
    const socio: SocioEntity = await socioRepository.save({
      nombre: faker.internet.userName(),
      correo: faker.internet.email(),
      fecha_nacimiento: faker.date.past()
    });

    await expect(() => service.addMemberToClub("0", socio.id)).rejects.toHaveProperty("message", "No se encontro ese club");
  });

  it('Adding an invalid member to a club should raise an exception', async () => {
    await expect(() => service.addMemberToClub(club.id, "0")).rejects.toHaveProperty("message", "No se encontro ese socio");
  });

  it('Find members from club should return al members related to a given club', async () => {
    const socios: SocioEntity[] = await service.findMembersFromClub(club.id);
    expect(socios).not.toBeNull();

    expect(socios.length).toBe(sociosList.length);
  });

  it('Find members from an invalid club should raise an exception', async () => {
    await expect(() => service.findMembersFromClub("0")).rejects.toHaveProperty("message", "No se encontro ese club");
  });

  it('Find member from club should return the associated requested member', async () => {
    const socio: SocioEntity = sociosList[0];

    const relatedSocio: SocioEntity = await service.findMemberFromClub(club.id, socio.id);
    expect(relatedSocio).not.toBeNull();

    expect(socio.nombre).toEqual(relatedSocio.nombre);
    expect(socio.correo).toEqual(relatedSocio.correo);
    expect(socio.fecha_nacimiento).toEqual(relatedSocio.fecha_nacimiento);
  });

  it('Find member from an invalid club should raise an exception', async () => {
    await expect(() => service.findMemberFromClub("0", sociosList[0].id)).rejects.toHaveProperty("message", "No se encontro ese club");
  });

  it('Find member an invalid member from an club should raise an exception', async () => {
    await expect(() => service.findMemberFromClub(club.id, "0")).rejects.toHaveProperty("message", "No se encontro ese socio");
  });

  it('Find member unrelated member of a club should raise an exception', async () => {
    const socio: SocioEntity = await socioRepository.save({
      nombre: faker.internet.userName(),
      correo: faker.internet.email(),
      fecha_nacimiento: faker.date.past()
    });

    await expect(() => service.findMemberFromClub(club.id, socio.id)).rejects.toHaveProperty("message", "El club no esta relacionado con el socio");
    
  });

  it('Update members from club should replace the members with a new array of members', async () => {
    const socio: SocioEntity = await socioRepository.save({
      nombre: faker.internet.userName(),
      correo: faker.internet.email(),
      fecha_nacimiento: faker.date.past()
    });

    const returnedClub: ClubEntity = await service.updateMembersFromClub(club.id, [socio]);
    expect(returnedClub).not.toBeNull();

    const searchedClub: ClubEntity = await clubRepository.findOne({
      where: {id: club.id},
      relations: {
        socios: true
      }
    });

    expect(searchedClub).not.toBeNull();

    expect(returnedClub.nombre).toEqual(searchedClub.nombre);
    expect(returnedClub.descripcion).toEqual(searchedClub.descripcion);
    expect(returnedClub.fecha_fundacion).toEqual(searchedClub.fecha_fundacion);
    expect(returnedClub.imagen).toEqual(searchedClub.imagen);

    expect(returnedClub.nombre).toEqual(club.nombre);
    expect(returnedClub.descripcion).toEqual(club.descripcion);
    expect(returnedClub.fecha_fundacion).toEqual(club.fecha_fundacion);
    expect(returnedClub.imagen).toEqual(club.imagen);

    expect(searchedClub.socios.length).toBe(1);
    
    const searchedSocio: SocioEntity = searchedClub.socios[0];

    expect(socio.nombre).toEqual(searchedSocio.nombre);
    expect(socio.correo).toEqual(searchedSocio.correo);
    expect(socio.fecha_nacimiento).toEqual(searchedSocio.fecha_nacimiento);

  });

  it('Update members of an invalid club should raise an exception', async () => {
    const socio: SocioEntity = await socioRepository.save({
      nombre: faker.internet.userName(),
      correo: faker.internet.email(),
      fecha_nacimiento: faker.date.past()
    });

    await expect(() => service.updateMembersFromClub("0", [socio])).rejects.toHaveProperty("message", "No se encontro ese club");
  });

  it('Update with invalid members the members of a club should raise an exception', async () => {
    const socio: SocioEntity = {
      id: "0",
      nombre: faker.internet.userName(),
      correo: faker.internet.email(),
      fecha_nacimiento: faker.date.past(),
      clubs: []
    };

    await expect(() => service.updateMembersFromClub(club.id, [socio])).rejects.toHaveProperty("message", "No se encontro uno de los socios");
  });

  it('Delete member from club should remove a member from the socios array in a specific club', async () => {
    const socio: SocioEntity = sociosList[0];

    await service.deleteMemberFromClub(club.id, socio.id);

    const searchedClub: ClubEntity = await clubRepository.findOne({
      where: {id: club.id},
      relations: {
        socios: true
      }
    });
    expect(searchedClub).not.toBeNull();

    const relatedSocio: SocioEntity = searchedClub.socios.find(e => e.id === socio.id);
    expect(relatedSocio).toBeUndefined();
  });

  it('Delete an unrelated member from a club should raise an exception', async () => {
    const socio: SocioEntity = await socioRepository.save({
      nombre: faker.internet.userName(),
      correo: faker.internet.email(),
      fecha_nacimiento: faker.date.past()
    });

    await expect(() => service.deleteMemberFromClub(club.id, socio.id)).rejects.toHaveProperty("message", "El club no esta relacionado con el socio");
  });

  it('Delete an invalid member from a club should raise an exception', async () => {
    await expect(() => service.deleteMemberFromClub(club.id, "0")).rejects.toHaveProperty("message", "No se encontro ese socio");
  });

  it('Delete a member from an invalid club should raise an exception', async () => {
    await expect(() => service.deleteMemberFromClub("0", sociosList[0].id)).rejects.toHaveProperty("message", "No se encontro ese club");
  });
});
