import mongoose from 'mongoose';
import {inject, injectable} from 'inversify';
import {IDatabase} from './databse-interface.js';
import {Component} from '../../models/component.js';
import {ILogger} from '../logger/logger-interface.js';

@injectable()
export default class DatabaseClient implements IDatabase {
  constructor(
    @inject(Component.ILogger) private logger: ILogger,
  ) {}

  public async connect(uri: string): Promise<void> {
    this.logger.info(`Try to connect to MongoDB…`);
    await mongoose.connect(uri);
    this.logger.info('Database connection established.');
  }

  public async disconnect(): Promise<void> {
    await mongoose.disconnect();
    this.logger.info('Database connection closed.');
  }
}
