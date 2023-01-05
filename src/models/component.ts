export const Component = {
  Application: Symbol.for('Application'),
  ILogger: Symbol.for('ILogger'),
  IConfig: Symbol.for('IConfig'),
  IDatabase: Symbol.for('IDatabase'),
  UserModel: Symbol.for('UserModel'),
  IUserService: Symbol.for('IUserService'),
  IFilmService: Symbol.for('IFilmService'),
  FilmModel: Symbol.for('FilmModel'),
  CommentModel: Symbol.for('CommentModel'),
  FilmController: Symbol.for('FilmController'),
  IExceptionFilter: Symbol.for('IExceptionFilter'),
  UserController: Symbol.for('UserController'),
  CommentController: Symbol.for('CommentController'),
  ICommentService: Symbol.for('ICommentService')
} as const;
