import { DocumentType } from '@typegoose/typegoose';
import CreateUserDto from '../dto/create-user-dto.js';
import {UserEntity} from '../db-user.js';
import LoginUserDto from '../dto/login-user-dto.js';
import {FilmEntity} from '../../film/db-film.js';

export interface IUserService {
  create(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>>;
  findByEmail(email: string): Promise<DocumentType<UserEntity> | null>;
  findOrCreate(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>>;
  verifyUser(dto: LoginUserDto, salt: string): Promise<DocumentType<UserEntity> | null>;
  findToWatch(userId: string): Promise<DocumentType<FilmEntity>[]>;
  addToWatch(movieId: string, userId: string): Promise<void | null>;
  deleteToWatch(movieId: string, userId: string): Promise<void | null>;
  setUserAvatarPath(userId: string, avatarPath: string): Promise<void | null>;
}
