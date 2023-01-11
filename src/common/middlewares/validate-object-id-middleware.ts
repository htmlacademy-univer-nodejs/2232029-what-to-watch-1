import {NextFunction, Request, Response} from 'express';
import {StatusCodes} from 'http-status-codes';
import mongoose from 'mongoose';
import HttpError from '../errors/http-error.js';
import {IMiddleware} from './middleware-interface.js';

const {Types} = mongoose;

export class ValidateObjectIdMiddleware implements IMiddleware {
  constructor(private param: string) {}

  public execute({params}: Request, _res: Response, next: NextFunction): void {
    const objectId = params[this.param];

    if (Types.ObjectId.isValid(objectId)) {
      return next();
    }

    throw new HttpError(
      StatusCodes.BAD_REQUEST,
      `${objectId} is invalid ObjectID`,
      'ValidateObjectIdMiddleware'
    );
  }
}
