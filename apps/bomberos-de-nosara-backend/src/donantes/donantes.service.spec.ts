import { Test, TestingModule } from '@nestjs/testing';
import { DonantesService } from './donantes.service';

describe('DonantesService', () => {
  let service: DonantesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DonantesService],
    }).compile();

    service = module.get<DonantesService>(DonantesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
