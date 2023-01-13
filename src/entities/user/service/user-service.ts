import { DocumentType } from '@typegoose/typegoose/lib/types.js';
import { inject, injectable } from 'inversify';
import { types } from '@typegoose/typegoose';
import {Component} from '../../../models/component.js';
import {IUserService} from './user-service-interface.js';
import {ILogger} from '../../../common/logger/logger-interface.js';
import {UserEntity} from '../db-user.js';
import CreateUserDto from '../dto/create-user-dto.js';
import LoginUserDto from '../dto/login-user-dto.js';
import {FilmEntity} from '../../film/db-film.js';

@injectable()
export default class UserService implements IUserService {
  constructor(@inject(Component.ILogger) private logger: ILogger,
    @inject(Component.UserModel) private readonly userModel: types.ModelType<UserEntity>,
    @inject(Component.FilmModel) private readonly filmModel: types.ModelType<FilmEntity>) { }

  async create(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>> {
    const user = new UserEntity(dto);
    user.setPassword(dto.password, salt);

    const result = await this.userModel.create(user);
    this.logger.info(`New user created: ${user.email}`);

    return result;
  }

  async findByEmail(email: string): Promise<DocumentType<UserEntity> | null> {
    return this.userModel.findOne({ email });
  }

  async findOrCreate(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>> {
    const existedUser = await this.findByEmail(dto.email);

    if (existedUser) {
      return existedUser;
    }

    return this.create(dto, salt);
  }

  public async verifyUser(dto: LoginUserDto, salt: string): Promise<DocumentType<UserEntity> | null> {
    const user = await this.findByEmail(dto.email);

    if (!user) {
      return null;
    }

    if (user.verifyPassword(dto.password, salt)) {
      return user;
    }

    return null;
  }

  async findToWatch(userId: string): Promise<DocumentType<FilmEntity>[]> {
    const filmsToWatch = await this.userModel.findById(userId).select('filmsToWatch');
    return this.filmModel.find({_id: { $in: filmsToWatch?.filmsToWatch }}).populate('user');
  }

  async addToWatch(filmId: string, userId: string): Promise<void | null> {
    return this.userModel.findByIdAndUpdate(userId, {
      $addToSet: {filmsToWatch: filmId}
    });
  }

  async deleteToWatch(filmId: string, userId: string): Promise<void | null> {
    return this.userModel.findByIdAndUpdate(userId, {
      $pull: {filmsToWatch: filmId}
    });
  }

  async setUserAvatarPath(userId: string, avatarPath: string): Promise<void | null> {
    return this.userModel.findByIdAndUpdate(userId, {avatarPath});
  }
}
