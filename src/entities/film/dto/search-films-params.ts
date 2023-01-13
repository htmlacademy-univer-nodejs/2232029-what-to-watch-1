import {Genre} from '../../../models/genre.js';

export type SearchFilmsParams = {
  limit?: number;
  genre?: Genre;
};
