export const getURI = (
  username: string,
  password: string,
  host: string,
  databaseName: string,
): string => `mongodb://${username}:${password}@${host}/${databaseName}?authSource=admin`;
