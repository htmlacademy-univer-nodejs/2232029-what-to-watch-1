import { inject, injectable } from 'inversify';
import { DocumentType, types } from '@typegoose/typegoose';
import {Component} from '../../../models/component.js';
import {IFilmService} from './film-service-interface.js';
import {FilmEntity} from '../db-film.js';
import {ILogger} from '../../../common/logger/logger-interface.js';
import UpdateFilmDto from '../dto/film-update-dto.js';
import CreateFilmDto from '../dto/film-create-dto.js';
import {MAX_FILMS_COUNT} from '../films-constants.js';
import {Genre} from '../../../models/genre.js';
import {MAX_COMMENTS_COUNT} from '../../comment/constants.js';

@injectable()
export default class FilmService implements IFilmService {
  constructor(
    @inject(Component.ILogger) private readonly logger: ILogger,
    @inject(Component.FilmModel) private readonly filmModel: types.ModelType<FilmEntity>
  ) { }

  async create(dto: CreateFilmDto): Promise<DocumentType<FilmEntity>> {
    const film = await this.filmModel.create(dto);
    this.logger.info(`New film created: ${dto.title}`);

    return film;
  }

  async findById(filmId: string): Promise<DocumentType<FilmEntity> | null> {
    return this.filmModel.findById(filmId).populate('user');
  }


  async findByName(filmTitle: string): Promise<DocumentType<FilmEntity> | null> {
    return this.filmModel.findOne({title: filmTitle}).populate('user');
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

  async update(dto: UpdateFilmDto): Promise<DocumentType<FilmEntity> | null> {
    return this.filmModel.findByIdAndUpdate(dto.id, dto).populate('user');
  }

  async deleteById(filmId: string): Promise<void | null> {
    return this.filmModel.findByIdAndDelete(filmId);
  }

  async findByGenre(genre: Genre, limit?: number): Promise<DocumentType<FilmEntity>[]> {
    return this.filmModel.find({genre}, {}, {limit}).populate('user');
  }

  async findByLimit(limit: number): Promise<DocumentType<FilmEntity>[]> {
    return this.filmModel.find({}, {}, {limit})
      .sort({publicationDate: -1})
      .limit(MAX_COMMENTS_COUNT)
      .populate('user');
  }

  async findPromo(): Promise<DocumentType<FilmEntity> | null> {
    return this.filmModel.findOne({isPromo: true}).populate('user');
  }

  async incCommentsCount(filmId: string): Promise<void | null> {
    return this.filmModel.findByIdAndUpdate(filmId, {$inc: {commentsCount: 1}});
  }

  async updateFilmRating(filmId: string, newRating: number): Promise<void | null> {
    const oldValues = await this.filmModel.findById(filmId).select('rating commentsCount');
    const oldRating = oldValues?.['rating'] ?? 0;
    const oldCommentsCount = oldValues?.['commentsCount'] ?? 0;
    return this.filmModel.findByIdAndUpdate(filmId, {
      rating: (oldRating * oldCommentsCount + newRating) / (oldCommentsCount + 1)
    });
  }

  async exists(documentId: string): Promise<boolean> {
    return (await this.filmModel.exists({_id: documentId})) !== null;
  }
}
