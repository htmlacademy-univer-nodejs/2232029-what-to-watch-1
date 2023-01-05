import {Request, Response} from 'express';
import {StatusCodes} from 'http-status-codes';
import {inject} from 'inversify';
import {Controller} from '../../../common/controller/controller.js';
import {ILogger} from '../../../common/logger/logger-interface.js';
import {ICommentService} from '../comments-service-interface.js';
import {IFilmService} from '../../film/service/film-service-interface.js';
import CreateCommentDto from '../dto/create-comment-dto.js';
import HttpError from '../../../common/errors/http-error.js';
import {HttpMethod} from '../../../models/http-method.js';
import {fillDTO} from '../../../utils/common.js';
import CommentResponse from '../response/comment-response.js';
import {Component} from '../../../models/component.js';
import {ValidateDtoMiddleware} from '../../../middlewares/validate-dto-middleware.js';

export default class CommentController extends Controller {
  constructor(@inject(Component.ILogger) logger: ILogger,
    @inject(Component.ICommentService) private readonly commentService: ICommentService,
    @inject(Component.IFilmService) private  readonly filmService: IFilmService) {
    super(logger);

    this.logger.info('Register routes for CommentController.');
    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [new ValidateDtoMiddleware(CreateCommentDto)]
    });
  }

  public async create({body}: Request<object, object, CreateCommentDto>, res: Response): Promise<void> {
    if (!await this.filmService.findById(body.filmId)) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Movie with id ${body.filmId} not found.`,
        'CommentController'
      );
    }

    const comment = await this.commentService.create(body);
    await this.filmService.incCommentsCount(body.filmId);
    this.created(res, fillDTO(CommentResponse, comment));
  }
}
