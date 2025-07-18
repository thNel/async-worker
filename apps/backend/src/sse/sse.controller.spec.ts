import { Test, TestingModule } from '@nestjs/testing';
import { SseController } from './sse.controller';
import { JobModule } from '../job/job.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from '../entities/job';

describe('SseController', () => {
  let controller: SseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JobModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Job],
          synchronize: true,
        }),
      ],
      controllers: [SseController],
    }).compile();

    controller = module.get<SseController>(SseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});