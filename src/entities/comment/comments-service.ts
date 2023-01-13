import {inject, injectable} from 'inversify';
import {types} from '@typegoose/typegoose';
import {DocumentType} from '@typegoose/typegoose/lib/types.js';
import {ICommentService} from './comments-service-interface.js';
import {CommentEntity} from './db-comment.js';
import CreateCommentDto from './dto/create-comment-dto.js';
import {IFilmService} from '../film/service/film-service-interface.js';
import {Component} from '../../models/component.js';
import {MAX_COMMENTS_COUNT} from './constants.js';

@injectable()
export default class CommentService implements ICommentService {
  constructor(@inject(Component.CommentModel) private readonly commentModel: types.ModelType<CommentEntity>,
    @inject(Component.IFilmService) private readonly filmService: IFilmService) {}

  public async create(dto: CreateCommentDto): Promise<DocumentType<CommentEntity>> {
    const comment = await this.commentModel.create(dto);
    await this.filmService.updateFilmRating(dto.filmId, dto.rating);
    await this.filmService.incCommentsCount(dto.filmId);
    return comment.populate('user');
  }

  public async findByFilmId(filmId: string): Promise<DocumentType<CommentEntity>[]> {
    return await this.commentModel.find({filmId})
      .sort({createdAt: -1})
      .limit(MAX_COMMENTS_COUNT)
      .populate('user');
  }

  async deleteByFilmId(filmId: string): Promise<void | null> {
    await this.commentModel.find({filmId}).deleteMany();
  }
}
