import {inject, injectable} from 'inversify';
import {types} from '@typegoose/typegoose';
import {DocumentType} from '@typegoose/typegoose/lib/types.js';
import {ICommentService} from './comments-service-interface.js';
import {CommentEntity} from './db-comment.js';
import CreateCommentDto from './dto/create-comment-dto.js';
import {IFilmService} from '../film/service/film-service-interface.js';
import {Component} from '../../models/component.js';

@injectable()
export default class CommentService implements ICommentService {
  constructor(@inject(Component.CommentModel) private readonly commentModel: types.ModelType<CommentEntity>,
    @inject(Component.IFilmService) private readonly filmService: IFilmService) {}

  public async create(dto: CreateCommentDto): Promise<DocumentType<CommentEntity>> {
    const comment = await this.commentModel.create(dto);
    await this.filmService.updateFilmRating(dto.filmId, dto.rating);
    await this.filmService.incCommentsCount(dto.filmId);
    return comment.populate('userId');
  }

  public async findByFilmId(filmId: string): Promise<DocumentType<CommentEntity>[]> {
    return this.commentModel.find({filmId}).populate('userId');
  }
}
