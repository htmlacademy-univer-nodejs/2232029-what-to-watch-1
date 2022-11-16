import {DocumentType} from '@typegoose/typegoose/lib/types.js';
import CreateCommentDto from './dto/create-comment-dto.js';
import {CommentEntity} from './db-comment.js';

export interface ICommentService {
  findByFilmId(filmId: string): Promise<DocumentType<CommentEntity>[]>;
  create(dto: CreateCommentDto): Promise<DocumentType<CommentEntity>>;
}
