import typegoose, {defaultClasses, getModelForClass, Severity} from '@typegoose/typegoose';
import {checkPassword, createSHA256} from '../../utils/common.js';
import {User} from './user.js';

const {prop, modelOptions} = typegoose;

export interface UserEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'users',
  },
  options: {
    allowMixed: Severity.ALLOW
  }
})
export class UserEntity extends defaultClasses.TimeStamps implements User {
  constructor(data: User) {
    super();

    this.name = data.name;
    this.email = data.email;
    this.avatar = data.avatar;
  }

  @prop({required: true })
  public name!: string;

  @prop({ unique: true, required: true })
  public email!: string;

  @prop({ required: false })
  public avatar: string | undefined;

  @prop({ required: true })
  private password!: string;

  @prop({required: true, default: []})
  public filmsToWatch!: string[];

  public setPassword(password: string, salt: string) {
    checkPassword(password);
    this.password = createSHA256(password, salt);
  }

  public verifyPassword(password: string, salt: string) {
    const hashPassword = createSHA256(password, salt);
    return hashPassword === this.password;
  }
}

export const UserModel = getModelForClass(UserEntity);
