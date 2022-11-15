export const Component = {
  Application: Symbol.for('Application'),
  ILogger: Symbol.for('ILogger'),
  IConfig: Symbol.for('IConfig'),
  IDatabase: Symbol.for('IDatabase'),
  UserModel: Symbol.for('UserModel'),
  IUserService: Symbol.for('IUserService'),
  IFilmService: Symbol.for('IFilmService'),
  FilmModel: Symbol.for('FilmModel'),
  CommentModel: Symbol.for('CommentModel')
} as const;
