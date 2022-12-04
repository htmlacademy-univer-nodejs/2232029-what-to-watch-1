import {Expose} from 'class-transformer';

export default class FilmResponse {
  @Expose()
  public id!: string;

  @Expose()
  public name!: string;
}
