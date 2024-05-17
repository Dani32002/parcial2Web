/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { SocioService } from './socio.service';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';

describe('SocioService', () => {
  let service: SocioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [SocioService],
    }).compile();

    service = module.get<SocioService>(SocioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
