import {ICliCommand} from './cli-command.interface.js';
import {FilmTsvFileReader} from '../common/file-reader/film-tsv-file-reader.js';
import {createFilm, getErrorMessage} from '../utils/common.js';
import {IUserService} from '../entities/user/user-service-interface.js';
import {IDatabase} from '../common/database-client/databse-interface.js';
import {IFilmService} from '../entities/film/film-service-interface.js';
import {ILogger} from '../common/logger/logger-interface.js';
import FilmService from '../entities/film/film-service.js';
import {FilmModel} from '../entities/film/db-film.js';
import UserService from '../entities/user/user-service.js';
import {UserModel} from '../entities/user/db-user.js';
import DatabaseClient from '../common/database-client/database-client.js';
import LoggerService from '../common/logger/logger.js';
import {Film} from '../entities/film/film.js';
import {getURI} from '../utils/db-helper.js';


const DEFAULT_USER_PASSWORD = '123456';

export default class ImportCommand implements ICliCommand {
  public readonly name = '--import';
  private userService!: IUserService;
  private filmService!: IFilmService;
  private databaseClient!: IDatabase;
  private readonly logger: ILogger;
  private salt!: string;

  constructor() {
    this.onLine = this.onLine.bind(this);
    this.onComplete = this.onComplete.bind(this);

    this.logger = new LoggerService();
    this.filmService = new FilmService(this.logger, FilmModel);
    this.userService = new UserService(this.logger, UserModel);
    this.databaseClient = new DatabaseClient(this.logger);
  }

  private async saveFilm(film: Film) {
    const user = await this.userService.findOrCreate({
      ...film.user,
      password: DEFAULT_USER_PASSWORD
    }, this.salt);
    await this.filmService.create({
      ...film,
      userId: user.id
    });
    this.logger.info("save film: ", JSON.stringify(film));
  }

  private async onLine(line: string, resolve: () => void) {
    const film = createFilm(line);
    this.logger.info(JSON.stringify(film));
    await this.saveFilm(film);
    resolve();
  }

  private async onComplete(count: number) {
    this.logger.info(`${count} rows imported.`);
    await this.databaseClient.disconnect();
  }

  public async execute(filename: string, userName: string, password: string,
    host: string, name: string, salt: string): Promise<void> {
    const uri = getURI(userName, password, host, name);
    this.salt = salt;
    await this.databaseClient.connect(uri);
    const fileReader = new FilmTsvFileReader(filename.trim());
    fileReader.on('line', this.onLine);
    fileReader.on('end', this.onComplete);

    try {
      await fileReader.read();
    } catch (err) {

      if (!(err instanceof Error)) {
        throw err;
      }

      this.logger.info(`Can't read the file: ${getErrorMessage(err)}`);
    }
  }
}
