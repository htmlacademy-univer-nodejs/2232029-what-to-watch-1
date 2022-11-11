import 'reflect-metadata';
import {inject, injectable} from 'inversify';
import {ILogger} from '../common/logger/logger-interface.js';
import {IConfig} from '../common/config/config-interface.js';
import {Component} from '../models/component.js';
import {IDatabase} from '../common/database-client/databse-interface.js';
import {getURI} from '../utils/db-helper.js';

@injectable()
export default class Application {
  constructor(
    @inject(Component.ILogger) private logger: ILogger,
    @inject(Component.IConfig) private config: IConfig,
    @inject(Component.IDatabase) private databaseClient: IDatabase
) {}

  public async init() {
    this.logger.info('Application initialization…');
    this.logger.info(`Get value from env $PORT: ${this.config.get('PORT')}`);

    const uri = getURI(
      this.config.get('DB_USER'),
      this.config.get('DB_PASSWORD'),
      this.config.get('DB_HOST'),
      this.config.get('DB_NAME'),
    );

    await this.databaseClient.connect(uri);
  }
}
