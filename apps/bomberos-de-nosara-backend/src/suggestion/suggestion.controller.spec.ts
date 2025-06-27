import { Test, TestingModule } from '@nestjs/testing';
import { SugerenciaController } from './suggestion.controller';


describe('SugerenciaController', () => {
  let controller: SugerenciaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SugerenciaController],
    }).compile();

    controller = module.get<SugerenciaController>(SugerenciaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});