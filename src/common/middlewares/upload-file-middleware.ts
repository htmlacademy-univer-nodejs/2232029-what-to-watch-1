import {NextFunction, Request, Response} from 'express';
import multer, {diskStorage} from 'multer';
import {nanoid} from 'nanoid';
import {IMiddleware} from './middleware-interface.js';
import {extension} from 'mime-types';

export class UploadFileMiddleware implements IMiddleware {
  constructor(private uploadDirectory: string,
    private fieldName: string) {}

  public async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    const storage = diskStorage({
      destination: this.uploadDirectory,
      filename: (_req, file, callback) => {
        console.log(file.mimetype)
        const ext = extension(file.mimetype);
        const filename = nanoid();
        callback(null, `${filename}.${ext}`);
      }
    });

    const uploadSingleFileMiddleware = multer({storage})
      .single(this.fieldName);

    uploadSingleFileMiddleware(req, res, next);
  }
}
