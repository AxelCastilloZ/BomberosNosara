import { Test, TestingModule } from '@nestjs/testing';
import { SugerenciaService } from './suggestion.service';

describe('SugerenciaService', () => {
  let service: SugerenciaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SugerenciaService],
    }).compile();

    service = module.get<SugerenciaService>(SugerenciaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});