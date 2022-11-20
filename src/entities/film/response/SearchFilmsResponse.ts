import {Expose} from 'class-transformer';
import {Film} from '../film';

export default class SearchFilmsResponse {
  @Expose()
  public films!: Film[];
}
