import 'reflect-metadata';
import {inject, injectable} from 'inversify';
import {ILogger} from '../common/logger/logger-interface.js';
import {IConfig} from '../common/config/config-interface.js';
import {Component} from '../models/component.js';

@injectable()
export default class Application {
  constructor(
    @inject(Component.LoggerInterface) private logger: ILogger,
    @inject(Component.ConfigInterface) private config: IConfig) {}

  public async init() {
    this.logger.info('Application initialization…');
    this.logger.info(`Get value from env $PORT: ${this.config.get('PORT')}`);
  }
}
