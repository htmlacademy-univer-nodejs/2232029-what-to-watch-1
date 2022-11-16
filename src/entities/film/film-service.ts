import { inject, injectable } from 'inversify';
import { DocumentType, types } from '@typegoose/typegoose';
import {Component} from '../../models/component.js';
import {IFilmService} from './film-service-interface.js';
import {FilmEntity} from './db-film.js';
import {ILogger} from '../../common/logger/logger-interface.js';
import UpdateFilmDto from './dto/film-update-dto.js';

const MAX_FILMS_COUNT = 60;

@injectable()
export default class FilmService implements IFilmService {
  constructor(
    @inject(Component.ILogger) private readonly logger: ILogger,
    @inject(Component.FilmModel) private readonly filmModel: types.ModelType<FilmEntity>
  ) { }

  async create(dto: UpdateFilmDto): Promise<DocumentType<FilmEntity>> {
    const film = await this.filmModel.create(dto);
    this.logger.info(`New film created: ${dto.title}`);

    return film;
  }

  async findById(filmId: string): Promise<DocumentType<FilmEntity> | null> {
    return this.filmModel.findById(filmId).exec();
  }

  async find(): Promise<DocumentType<FilmEntity>[]> {
    return this.filmModel.aggregate([
      {
        $lookup: {
          from: 'comments',
          let: {filmId: '$_id'},
          pipeline: [
            {$match: {$expr: {$in: ['$$filmId', '$films']}}},
            {$project: {_id: 1}}
          ],
          as: 'comments'
        },
      },
      {
        $addFields: {
          id: {$toString: '$_id'},
          commentsCount: {$size: '$comments'},
          rating: {$avg: '$comments.rating'}
        }
      },
      {$unset: 'comments'},
      {$limit: MAX_FILMS_COUNT}
    ]);
  }

  async updateById(filmId: string, dto: UpdateFilmDto): Promise<DocumentType<FilmEntity> | null> {
    return this.filmModel.findByIdAndUpdate(filmId, dto).populate('userId');
  }

  async deleteById(filmId: string): Promise<void | null> {
    return this.filmModel.findByIdAndDelete(filmId);
  }

  async findByGenre(genre: string, limit?: number): Promise<DocumentType<FilmEntity>[]> {
    return this.filmModel.find({genre}, {}, {limit}).populate('userId');
  }

  async findPromo(): Promise<DocumentType<FilmEntity> | null> {
    return this.filmModel.findOne({isPromo: true}).populate('userId');
  }

  async incCommentsCount(filmId: string): Promise<void | null> {
    return this.filmModel.findByIdAndUpdate(filmId, {$inc: {commentsCount: 1}});
  }

  async updateFilmRating(filmId: string, newRating: number): Promise<void | null> {
    const oldValues = await this.filmModel.findById(filmId).select('rating commentsCount');;
    const oldRating = oldValues?.['rating'] ?? 0;
    const oldCommentsCount = oldValues?.['commentsCount'] ?? 0;
    return this.filmModel.findByIdAndUpdate(filmId, {
      rating: (oldRating * oldCommentsCount + newRating) / (oldCommentsCount + 1)
    });
  }
}
