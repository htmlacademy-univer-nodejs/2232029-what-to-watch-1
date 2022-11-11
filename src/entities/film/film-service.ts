import { inject, injectable } from 'inversify';
import { DocumentType, types } from '@typegoose/typegoose';
import {Component} from '../../models/component.js';
import {IFilmService} from './film-service-interface.js';
import {FilmEntity} from './db-film.js';
import {ILogger} from '../../common/logger/logger-interface.js';
import CreateFilmDto from './dto/film-create-dto.js';

@injectable()
export default class FilmService implements IFilmService {
  constructor(
    @inject(Component.ILogger) private readonly logger: ILogger,
    @inject(Component.FilmModel) private readonly movieModel: types.ModelType<FilmEntity>
  ) { }

  async create(dto: CreateFilmDto): Promise<DocumentType<FilmEntity>> {
    const movie = await this.movieModel.create(dto);
    this.logger.info(`New movie created: ${dto.title}`);

    return movie;
  }

  async findById(movieId: string): Promise<DocumentType<FilmEntity> | null> {
    return this.movieModel.findById(movieId).exec();
  }
}
