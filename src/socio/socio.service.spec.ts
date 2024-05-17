/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { SocioService } from './socio.service';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { SocioEntity } from './socio.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('SocioService', () => {
  let service: SocioService;
  let repository: Repository<SocioEntity>;
  let sociosList: SocioEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [SocioService],
    }).compile();

    service = module.get<SocioService>(SocioService);
    repository = module.get<Repository<SocioEntity>>(getRepositoryToken(SocioEntity));

    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();

    sociosList = [];
    for (let i = 0; i < 5; i++) {
      const socio: SocioEntity = await repository.save({
        nombre: faker.internet.userName(),
        correo: faker.internet.email(),
        fecha_nacimiento: faker.date.past()
      });
      sociosList.push(socio);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Find all should return all Socios', async () => {
    const socios: SocioEntity[] = await service.findAll();

    expect(socios).not.toBeNull();
    expect(socios.length).toBe(sociosList.length);
  });

  it('Find one should return the socio with the given id', async () => {
    const socio: SocioEntity = sociosList[0];

    const searchSocio: SocioEntity = await service.findOne(socio.id);

    expect(searchSocio).not.toBeNull();
    expect(searchSocio.nombre).toEqual(socio.nombre);
    expect(searchSocio.correo).toEqual(socio.correo);
    expect(searchSocio.fecha_nacimiento).toEqual(socio.fecha_nacimiento);
  });

  it('Find one with an invalid id should raise an exception', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "No se encontro ese socio");
  });

  it('Create should persist the given socio', async () => {
    const socio: SocioEntity = {
      id: "",
      nombre: faker.internet.userName(),
      correo: faker.internet.email(),
      fecha_nacimiento: faker.date.past(),
      clubs: []
    }

    const returnedSocio: SocioEntity = await service.create(socio);

    expect(returnedSocio).not.toBeNull();

    const storedSocio: SocioEntity = await repository.findOne({
      where: {id: returnedSocio.id}
    });

    expect(storedSocio).not.toBeNull();

    expect(returnedSocio.nombre).toEqual(socio.nombre);
    expect(returnedSocio.correo).toEqual(socio.correo);
    expect(returnedSocio.fecha_nacimiento).toEqual(socio.fecha_nacimiento);

    expect(storedSocio.nombre).toEqual(socio.nombre);
    expect(storedSocio.correo).toEqual(socio.correo);
    expect(storedSocio.fecha_nacimiento).toEqual(socio.fecha_nacimiento);

  });

  it('Create given a socio with an invalid email should raise an exception', async () => {
    const socio: SocioEntity = {
      id: "",
      nombre: faker.internet.userName(),
      correo: "invalidEmail",
      fecha_nacimiento: faker.date.past(),
      clubs: []
    }

    await expect(() => service.create(socio)).rejects.toHaveProperty("message", "El correo no contiene @");
  });

  it('Update should persist changes an specific socio', async () => {
    const socio: SocioEntity = sociosList[0];
    socio.nombre = "Daniel Escalante Perez",
    socio.correo = "d.escalante@uniandes.edu.co",
    socio.fecha_nacimiento = new Date("11/06/2002");

    const returnedSocio: SocioEntity = await service.update(socio.id, socio);

    expect(returnedSocio).not.toBeNull();

    const searchedSocio: SocioEntity = await repository.findOne({
      where: {id: socio.id}
    });

    expect(searchedSocio).not.toBeNull();

    expect(returnedSocio.nombre).toEqual(socio.nombre);
    expect(returnedSocio.correo).toEqual(socio.correo);
    expect(returnedSocio.fecha_nacimiento).toEqual(socio.fecha_nacimiento);

    expect(searchedSocio.nombre).toEqual(socio.nombre);
    expect(searchedSocio.correo).toEqual(socio.correo);
    expect(searchedSocio.fecha_nacimiento).toEqual(socio.fecha_nacimiento);
  });

  it('Update with an invalid id should raise an exception', async () => {
    const socio: SocioEntity = sociosList[0];
    socio.nombre = "Daniel Escalante Perez",
    socio.correo = "d.escalante@uniandes.edu.co",
    socio.fecha_nacimiento = new Date("11/06/2002");

    await expect(() => service.update("0", socio)).rejects.toHaveProperty("message", "No se encontro ese socio");
  });

  it('Update with an invalid email should raise an exception', async () => {
    const socio: SocioEntity = sociosList[0];
    socio.nombre = "Daniel Escalante Perez",
    socio.correo = "invalidemail",
    socio.fecha_nacimiento = new Date("11/06/2002");

    await expect(() => service.update(socio.id, socio)).rejects.toHaveProperty("message", "El correo no contiene @");
  });

  it('Delete should remove a socio', async () => {
    const socio: SocioEntity = sociosList[0];

    await service.delete(socio.id);

    const searchedSocio: SocioEntity = await repository.findOne({
      where: {id: socio.id}
    });

    expect(searchedSocio).toBeNull();
  });

  it('Delete with an invalid id should raise an exception', async () => {
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "No se encontro ese socio");
  });

});
