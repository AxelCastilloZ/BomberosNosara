import { Test, TestingModule } from '@nestjs/testing';
import { EquipoBomberilController } from './equipo-bomberil.controller';
import { EquipoBomberilService } from './equipo-bomberil.service';

describe('EquipoBomberilController', () => {
  let controller: EquipoBomberilController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EquipoBomberilController],
      providers: [EquipoBomberilService],
    }).compile();

    controller = module.get<EquipoBomberilController>(EquipoBomberilController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
