import { createClient } from 'contentful';
import dotenv, { config } from 'dotenv';
config();

const spaceId = '7lpoj3cttgsl';
const accessToken = 'Bnl4ZXSqkmTptGPGbZ4u9DLqecgXJKztoxM2LAzjmxs';

export const contentfulClient = createClient({
  space: spaceId,
  accessToken: accessToken
});
