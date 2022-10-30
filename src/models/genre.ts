export enum Genre {
    Comedy = 'comedy',
    Crime = 'crime',
    Documentary = 'documentary',
    Drama = 'drama',
    Horror = 'horror',
    Family = 'family',
    Romance = 'romance',
    Scifi = 'scifi',
    Thriller = 'thriller',
}

export const GENRE_ARRAY: string[] = [Genre.Comedy, Genre.Crime, Genre.Documentary, Genre.Drama, Genre.Family,
  Genre.Horror, Genre.Romance, Genre.Scifi, Genre.Thriller];

export function getGenre(value: string): Genre | never {
  if (!GENRE_ARRAY.includes(value)) {
    throw new Error(`Unrecognised genre: ${value}.`);
  }
  return <Genre>value;
}
