import { Test, TestingModule } from '@nestjs/testing';
import { EquipoBomberilService } from './equipo-bomberil.service';

describe('EquipoBomberilService', () => {
  let service: EquipoBomberilService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EquipoBomberilService],
    }).compile();

    service = module.get<EquipoBomberilService>(EquipoBomberilService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
