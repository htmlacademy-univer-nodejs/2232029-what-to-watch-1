import typegoose, {defaultClasses, getModelForClass } from '@typegoose/typegoose';
import {checkPassword, createSHA256} from '../../utils/common.js';
import {User} from './user.js';

const {prop, modelOptions} = typegoose;

export interface UserEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'users',
  },
})
export class UserEntity extends defaultClasses.TimeStamps implements User {
  constructor(data: User) {
    super();

    this.name = data.name;
    this.email = data.email;
    this.avatar = data.avatar;
  }


  @prop({
    required: true,
    minlength: [1, 'Min length for username is 1'],
    maxlength: [15, 'Max length for username is 15']
  })
  public name!: string;

  @prop({ unique: true, required: true })
  public email!: string;

  @prop({ required: false })
  public avatar: string | undefined;

  @prop({ required: true })
  private password!: string;

  public setPassword(password: string, salt: string) {
    checkPassword(password);
    this.password = createSHA256(password, salt);
  }

  public getPassword() {
    return this.password;
  }
}

export const UserModel = getModelForClass(UserEntity);
