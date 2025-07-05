import { Test, TestingModule } from '@nestjs/testing';
import { DonantesController } from './donantes.controller';

describe('DonantesController', () => {
  let controller: DonantesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DonantesController],
    }).compile();

    controller = module.get<DonantesController>(DonantesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
