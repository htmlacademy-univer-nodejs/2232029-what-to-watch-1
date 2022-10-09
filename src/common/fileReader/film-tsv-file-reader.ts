import {readFileSync} from 'fs';
import {IFileReader} from './file-reader-interface.js';
import {Film} from '../../entities/film';
import {Genre} from '../../models/genre';

export class FilmTsvFileReader implements IFileReader {
  private rawData = '';

  constructor(public filePath: string) { }

  public read(): void {
    this.rawData = readFileSync(this.filePath, {encoding: 'utf-8'});
  }

  public toArray(): Film[] {
    if (!this.rawData) {
      return [];
    }

    return this.rawData
      .split('\n')
      .filter((row) => row.trim() !== '')
      .map((row) => row.split('\t'))
      .map(([
        title,
        description,
        publicationDate,
        genre,
        releaseYear,
        rating,
        moviePreviewLink,
        movieLink,
        actors,
        producer,
        durationInMinutes,
        commentsCount,
        userNickname,
        userEmail,
        userAvatar,
        userPassword,
        posterLink,
        backgroundImageLink,
        backgroundColor
      ]) => ({
        title: title,
        description: description,
        publicationDate: new Date(publicationDate),
        genre: genre as Genre,
        releaseYear: parseInt(releaseYear, 10),
        rating: parseFloat(rating),
        moviePreviewLink: moviePreviewLink,
        movieLink: movieLink,
        actors: actors.split(';'),
        producer: producer,
        durationInMinutes: parseInt(durationInMinutes, 10),
        commentsCount: parseInt(commentsCount, 10),
        user: { nickname: userNickname, email: userEmail, avatar: userAvatar, password: userPassword},
        posterLink: posterLink,
        backgroundImageLink: backgroundImageLink,
        backgroundColor: backgroundColor
      }));
  }
}
