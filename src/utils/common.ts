import { Film } from '../entities/film.js';
import { getGenre } from '../models/genre.js';

export const createFilm = (row: string) => {
  const tokens = row.replace('\n', '').split('\t');
  const [
    title, description, published, genre,
    released, rating, previewLink, link,
    actors, producer, durationInMinutes, commentsCount,
    name, email, avatar, password, posterLink,
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
    commentsCount: Number.parseInt(commentsCount, 10),
    user: { name, email, avatar, password },
    posterLink,
    backgroundImageLink,
    backgroundColor,
  };

  return film;
};
