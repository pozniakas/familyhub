import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { FamilyEntity } from './entity/FamilyEntity';
import { Section } from './entity/Section';
import { Item } from './entity/Item';
import { Task } from './entity/Task';
import { User } from './entity/User';
import { PushSubscription } from './entity/PushSubscription';
import { InitialSchema1744408800000 } from './migrations/1744408800000-InitialSchema';
import { AddUsers1744408800001 } from './migrations/1744408800001-AddUsers';
import { AddPushSubscriptions1744408800002 } from './migrations/1744408800002-AddPushSubscriptions';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'familyhub',
  password: process.env.DB_PASSWORD || 'familyhub',
  database: process.env.DB_NAME || 'familyhub',
  synchronize: false, // never true — always use migrations
  logging: process.env.NODE_ENV !== 'production',
  entities: [FamilyEntity, Section, Item, Task, User, PushSubscription],
  migrations: [InitialSchema1744408800000, AddUsers1744408800001, AddPushSubscriptions1744408800002],
});
