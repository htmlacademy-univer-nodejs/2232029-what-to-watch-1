import { Film } from '../entities/film/film.js';
import {getGenre} from '../models/genre.js';
import * as crypto from 'crypto';

export const createFilm = (row: string) => {
  const tokens = row.replace('\n', '').split('\t');
  const [
    title, description, published, genre,
    released, rating, previewLink, link,
    actors, producer, durationInMinutes,
    name, email, avatar, posterLink,
    backgroundImageLink, backgroundColor
  ] = tokens;

  const film: Film = {
    title,
    description,
    publicationDate: new Date(published),
    genre: getGenre(genre),
    releaseYear: Number.parseInt(released, 10),
    rating: Number.parseFloat(rating),
    previewLink,
    link,
    actors: actors.split(','),
    producer,
    durationInMinutes: Number.parseInt(durationInMinutes, 10),
    user: { name, email, avatar },
    posterLink,
    backgroundImageLink,
    backgroundColor,
  };

  return film;
};

export const createSHA256 = (line: string, salt: string): string => {
  const shaHasher = crypto.createHmac('sha256', salt);
  return shaHasher.update(line).digest('hex');
};

export const checkPassword = (password: string): void =>
{
  if (password.length < 6 || password.length > 12) {
    throw new Error('Password must be from 6 to 12 characters.');
  }
};

export const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : '';
