import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeOrmConfig from '../typeorm.config';
import { JobModule } from '../job/job.module';
import { SseModule } from '../sse/sse.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), JobModule, SseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
