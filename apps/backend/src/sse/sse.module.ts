import { Module } from '@nestjs/common';
import { SseController } from './sse.controller';
import { JobModule } from '../job/job.module';

@Module({
  imports: [JobModule],
  controllers: [SseController],
})
export class SseModule {}