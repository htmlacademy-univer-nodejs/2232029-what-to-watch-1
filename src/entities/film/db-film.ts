import typegoose, {defaultClasses, getModelForClass, Ref } from '@typegoose/typegoose';
import {Genre, GENRE_ARRAY} from '../../models/genre.js';
import {UserEntity} from '../user/db-user.js';

const { prop, modelOptions } = typegoose;

export interface FilmEntity extends defaultClasses.Base { }

@modelOptions({
  schemaOptions: {
    collection: 'films'
  },
})
export class FilmEntity extends defaultClasses.TimeStamps {
  @prop({ trim: true, required: true, minlength: 2, maxlength: 100 })
  public title!: string;

  @prop({ trim: true, required: true, minlength: 20, maxlength: 1024 })
  public description!: string;

  @prop({ required: true })
  public publicationDate!: Date;

  @prop({
    type: () => String,
    required: true,
    enum: GENRE_ARRAY
  })
  public genre!: Genre;

  @prop({ required: true })
  public releaseYear!: number;

  @prop({ required: true })
  public rating!: number;

  @prop({ required: false, default: 0 })
  public commentsCount!: number;

  @prop({ required: true })
  public previewLink!: string;

  @prop({ required: true })
  public link!: string;

  @prop({ required: true })
  public actors!: string[];

  @prop({ required: true, minlength: 2, maxlength: 50 })
  public producer!: string;

  @prop({ required: true })
  public durationInMinutes!: number;

  @prop({
    ref: UserEntity,
    required: true
  })
  public userId!: Ref<UserEntity>;

  @prop({ required: true })
  public posterLink!: string;

  @prop({ required: true })
  public backgroundImageLink!: string;

  @prop({ required: true })
  public backgroundColor!: string;
}

export const FilmModel = getModelForClass(FilmEntity);
