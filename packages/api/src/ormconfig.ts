import dotenv from 'dotenv';
import { ConnectionOptions } from 'typeorm';

import { DEFAULT_DB_PORT } from './constants';
import { Role } from './entities/role.entity';
import { Space } from './entities/space.entity';
import { User } from './entities/user.entity';

dotenv.config();

const connectionOptions: ConnectionOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || DEFAULT_DB_PORT, 10),
  username: process.env.DB_USERNAME,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  logging: process.env.DB_LOGGING === 'true',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  entities: [User, Role, Space],
  migrations: [`src/migrations/**/*.ts`],
};

export default connectionOptions;
