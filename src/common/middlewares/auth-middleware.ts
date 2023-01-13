import {NextFunction, Request, Response} from 'express';
import {StatusCodes} from 'http-status-codes';
import * as jose from 'jose';
import HttpError from '../errors/http-error.js';
import {IMiddleware} from './middleware-interface.js';
import {createSecretKey} from 'crypto';

export class AuthenticateMiddleware implements IMiddleware {
  constructor(private readonly jwtSecret: string) {}

  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const authorizationHeader = req.headers?.authorization?.split(' ');
    if (!authorizationHeader) {
      return next();
    }

    const [, token] = authorizationHeader;

    try {
      const {payload} = await jose.jwtVerify(token, createSecretKey(this.jwtSecret, 'utf-8'));
      req.user = { email: `${payload.email}`, id: `${payload.id}` };
      return next();
    } catch {

      return next(new HttpError(
        StatusCodes.FORBIDDEN,
        'Invalid token',
        'AuthenticateMiddleware')
      );
    }
  }
}
