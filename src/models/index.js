// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Song, Creator, Category, Album, User } = initSchema(schema);

export {
  Song,
  Creator,
  Category,
  Album,
  User
};