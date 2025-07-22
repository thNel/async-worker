import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Job } from './entities/job';
import { Logger } from '@nestjs/common';

const isDevMode = process.env.NODE_ENV === 'development';

const config: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'db.sqlite',
  entities: [Job],
  synchronize: isDevMode,
  logging: false,
};

Logger.log(`Development mode: ${isDevMode}`);

export default config;
