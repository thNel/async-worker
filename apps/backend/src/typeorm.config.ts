import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Job } from './entities/job';

const config: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'db.sqlite',
  entities: [Job],
  synchronize: true, // только для dev
  logging: true,
};

export default config;