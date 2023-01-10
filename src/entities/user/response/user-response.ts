import {Expose} from 'class-transformer';

export default class UserResponse {
  @Expose()
  public email!: string ;

  @Expose()
  public avatar!: string;

  @Expose()
  public firstname!: string;

  @Expose()
  public lastname!: string;
}
