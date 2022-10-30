import 'reflect-metadata';
import {Container} from 'inversify';
import {ILogger} from './common/logger/logger-interface.js';
import LoggerService from './common/logger/logger.js';
import {Component} from './models/component.js';
import {IConfig} from './common/config/config-interface.js';
import ConfigService from './common/config/config-service.js';
import Application from './app/application.js';

const applicationContainer = new Container();
applicationContainer.bind<Application>(Component.Application).to(Application).inSingletonScope();
applicationContainer.bind<ILogger>(Component.LoggerInterface).to(LoggerService).inSingletonScope();
applicationContainer.bind<IConfig>(Component.ConfigInterface).to(ConfigService).inSingletonScope();

const application = applicationContainer.get<Application>(Component.Application);
await application.init();
