import postgres, { Sql } from 'postgres';

export const connectToPostgres = (url: string): Sql => {
  return postgres(url);
};
