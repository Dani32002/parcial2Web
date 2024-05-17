/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { ClubService } from './club.service';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { ClubEntity } from './club.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('ClubService', () => {
  let service: ClubService;
  let repository: Repository<ClubEntity>;
  let clubsList: ClubEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClubService],
    }).compile();

    service = module.get<ClubService>(ClubService);
    repository = module.get<Repository<ClubEntity>>(getRepositoryToken(ClubEntity));

    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();

    clubsList = [];
    for (let i = 0; i < 5; i++) {
      const club: ClubEntity = await repository.save({
          nombre: faker.company.name(),
          descripcion: faker.lorem.sentence(),
          fecha_fundacion: faker.date.past(),
          imagen: faker.image.url()
      });
      clubsList.push(club);
    }
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Find all should return all clubs', async () => {
    const clubs: ClubEntity[] = await service.findAll();
    
    expect(clubs).not.toBeNull();
    expect(clubs.length).toBe(clubsList.length);
  });

  it('Find one should return the club with the given id', async () => {
    const club: ClubEntity = clubsList[0];

    const searchClub: ClubEntity = await service.findOne(club.id);

    expect(searchClub).not.toBeNull();
    expect(club.nombre).toEqual(searchClub.nombre);
    expect(club.descripcion).toEqual(searchClub.descripcion);
    expect(club.fecha_fundacion).toEqual(searchClub.fecha_fundacion);
    expect(club.imagen).toEqual(searchClub.imagen);
  });

  it('Find one with an invalid id should raise an exception', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "No se encontro ese club");
  });

  it('Create should persist the given club', async () => {
    const club: ClubEntity = {
      id: "",
      nombre: faker.company.name(),
      descripcion: faker.lorem.sentence(),
      fecha_fundacion: faker.date.past(),
      imagen: faker.image.url(),
      socios:[]
    };

    const returnedClub: ClubEntity = await service.create(club);
    expect(returnedClub).not.toBeNull();

    const storedClub: ClubEntity = await repository.findOne({
      where: {id: returnedClub.id}
    });
    expect(storedClub).not.toBeNull();
    
    expect(club.nombre).toEqual(storedClub.nombre);
    expect(club.descripcion).toEqual(storedClub.descripcion);
    expect(club.fecha_fundacion).toEqual(storedClub.fecha_fundacion);
    expect(club.imagen).toEqual(storedClub.imagen);

    expect(club.nombre).toEqual(returnedClub.nombre);
    expect(club.descripcion).toEqual(returnedClub.descripcion);
    expect(club.fecha_fundacion).toEqual(returnedClub.fecha_fundacion);
    expect(club.imagen).toEqual(returnedClub.imagen);

  });

  it('Create with an invalid club description should raise an exception', async () => {
    const club: ClubEntity = {
      id: "",
      nombre: faker.company.name(),
      descripcion: faker.lorem.sentence(100),
      fecha_fundacion: faker.date.past(),
      imagen: faker.image.url(),
      socios:[]
    };

    await expect(() => service.create(club)).rejects.toHaveProperty("message", "La descripción supera la longitud permitida de 100");
  });

  it('Update should modify an existing club', async () => {
    const club: ClubEntity = clubsList[0];
    club.nombre = "Club Penguin";
    club.descripcion = "Great game!";
    club.fecha_fundacion = new Date("10/05/2016");
    club.imagen = "www.instagram.com";

    const returnedClub: ClubEntity = await service.update(club.id, club);
    expect(returnedClub).not.toBeNull();

    const storedClub: ClubEntity = await repository.findOne({
      where: {id: club.id}
    });
    expect(storedClub).not.toBeNull();

    expect(club.nombre).toEqual(storedClub.nombre);
    expect(club.descripcion).toEqual(storedClub.descripcion);
    expect(club.fecha_fundacion).toEqual(storedClub.fecha_fundacion);
    expect(club.imagen).toEqual(storedClub.imagen);

    expect(club.nombre).toEqual(returnedClub.nombre);
    expect(club.descripcion).toEqual(returnedClub.descripcion);
    expect(club.fecha_fundacion).toEqual(returnedClub.fecha_fundacion);
    expect(club.imagen).toEqual(returnedClub.imagen);
  });

  it('Update given an invalid id should raise an exception', async () => {
    const club: ClubEntity = clubsList[0];
    club.nombre = "Club Penguin";
    club.descripcion = "Great game!";
    club.fecha_fundacion = new Date("10/05/2016");
    club.imagen = "www.instagram.com";

    await expect(() => service.update("0", club)).rejects.toHaveProperty("message", "No se encontro ese club");
  });

  it('Update given an invalid club description should raise an exception', async () => {
    const club: ClubEntity = clubsList[0];
    club.nombre = "Club Penguin";
    club.descripcion = faker.lorem.sentence(100);
    club.fecha_fundacion = new Date("10/05/2016");
    club.imagen = "www.instagram.com";

    await expect(() => service.update(club.id, club)).rejects.toHaveProperty("message", "La descripción supera la longitud permitida de 100");
  });

  it('Delete should remove a club', async () => {
    const club: ClubEntity = clubsList[0];

    await service.delete(club.id);

    const storedClub: ClubEntity = await repository.findOne({
      where: {id: club.id}
    });
    expect(storedClub).toBeNull();

  });

  it('Delete given an invalid id should raise an exception', async () => {
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "No se encontro ese club");
  });


});
