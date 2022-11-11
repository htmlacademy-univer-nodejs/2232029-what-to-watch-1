import { DocumentType } from '@typegoose/typegoose';
import CreateFilmDto from './dto/film-create-dto.js';
import {FilmEntity} from './db-film.js';

export interface IFilmService {
  create(dto: CreateFilmDto): Promise<DocumentType<FilmEntity>>;
  findById(movieId: string): Promise<DocumentType<FilmEntity> | null>;
}
