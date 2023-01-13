import {Request, Response} from 'express';
import {inject, injectable} from 'inversify';
import {StatusCodes} from 'http-status-codes';
import {Controller} from '../../../common/controller/controller.js';
import {ILogger} from '../../../common/logger/logger-interface.js';
import {IFilmService} from '../service/film-service-interface.js';
import {Component} from '../../../models/component.js';
import {HttpMethod} from '../../../models/http-method.js';
import {fillDTO} from '../../../utils/common.js';
import FilmResponse from '../response/film-response.js';
import UpdateFilmDto from '../dto/film-update-dto.js';
import HttpError from '../../../common/errors/http-error.js';
import CreateFilmDto from '../dto/film-create-dto.js';
import {MAX_FILMS_COUNT} from '../films-constants.js';
import {ICommentService} from '../../comment/comments-service-interface.js';
import {ValidateDtoMiddleware} from '../../../common/middlewares/validate-dto-middleware.js';
import {DocumentExistsMiddleware} from '../../../common/middlewares/document-exist-middleware.js';
import {ValidateObjectIdMiddleware} from '../../../common/middlewares/validate-object-id-middleware.js';
import CommentResponse from '../../comment/response/comment-response.js';
import {PrivateRouteMiddleware} from '../../../common/middlewares/private-route-moddleware.js';
import {SearchFilmsParams} from '../dto/search-films-params.js';
import FilmSearchItem from '../response/film-search-item.js';
import {IUserService} from '../../user/service/user-service-interface.js';

@injectable()
export default class FilmController extends Controller {
  constructor(
    @inject(Component.ILogger) logger: ILogger,
    @inject(Component.IFilmService) private readonly filmsService: IFilmService,
    @inject(Component.ICommentService) private readonly commentService: ICommentService,
    @inject(Component.IUserService) private readonly userService: IUserService
  ) {
    super(logger);

    this.logger.info('Register routes for Films Controller');

    this.addRoute({
      path: '/',
      method: HttpMethod.Get,
      handler: this.search
    });
    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.createFilm,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateDtoMiddleware(CreateFilmDto)]
    });

    this.addRoute({
      path: '/watch',
      method: HttpMethod.Post,
      handler: this.postToWatch,
      middlewares: [new PrivateRouteMiddleware()]
    });
    this.addRoute({
      path: '/watch',
      method: HttpMethod.Delete,
      handler: this.deleteToWatch,
      middlewares: [new PrivateRouteMiddleware()]
    });

    this.addRoute({
      path: '/watch',
      method: HttpMethod.Get,
      handler: this.getToWatch,
      middlewares: [new PrivateRouteMiddleware()]
    });

    this.addRoute({
      path: '/promo',
      method: HttpMethod.Get,
      handler: this.getPromo,
    });
    this.addRoute({
      path: '/:id',
      method: HttpMethod.Get,
      handler: this.get,
      middlewares: [
        new ValidateObjectIdMiddleware('id')
      ]
    });
    this.addRoute({
      path: '/',
      method: HttpMethod.Patch,
      handler: this.update,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateDtoMiddleware(UpdateFilmDto),
        new DocumentExistsMiddleware(this.filmsService, 'Film', 'id')
      ]
    });
    this.addRoute({
      path: '/:id',
      method: HttpMethod.Delete,
      handler: this.delete,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('id'),
        new DocumentExistsMiddleware(this.filmsService, 'Film', 'id')
      ]
    });
    this.addRoute({
      path: '/:filmId/comments',
      method: HttpMethod.Get,
      handler: this.getComments,
      middlewares: [
        new ValidateObjectIdMiddleware('filmId'),
        new DocumentExistsMiddleware(this.filmsService, 'Film', 'filmId')
      ]
    });
  }

  public async createFilm(req: Request<Record<string, unknown>, Record<string, unknown>, CreateFilmDto>,
    res: Response): Promise<void> {
    const {body, user } = req;

    const existFilm = await this.filmsService.findByName(body.title);

    if (existFilm) {
      throw new HttpError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        `Film with name «${body.title}» exists.`,
        'FilmController'
      );
    }

    const result = await this.filmsService.create({...body, user: user.id});
    this.created(res, fillDTO(FilmResponse, result));
  }

  public async update(
    req: Request<Record<string, unknown>, UpdateFilmDto>,
    res: Response): Promise<void> {
    const {body, user} = req;
    const existFilm = await this.filmsService.findById(body.id);

    if (!existFilm) {
      throw new HttpError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        `Film with id «${body.id}» not exists.`,
        'FilmController'
      );
    }
    if (existFilm.user?.id !== user.id) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        'Only the owner can edit films. ',
        'FilmController'
      );
    }
    const result = await this.filmsService.update({...body, user: user.id});
    this.ok(res, fillDTO(FilmResponse, result));
  }

  public async get(
    {params}: Request<Record<string, string>>,
    res: Response): Promise<void> {

    const existFilm = await this.filmsService.findById(params.id);

    if (!existFilm) {
      throw new HttpError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        `Film with id «${params.id}» not exists.`,
        'FilmController'
      );
    }

    this.ok(res, fillDTO(FilmResponse, existFilm));
  }

  public async delete(
    req: Request<Record<string, string>>,
    res: Response): Promise<void> {
    const {params, user} = req;
    const existFilm = await this.filmsService.findById(params.id);

    if (!existFilm) {
      throw new HttpError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        `Film with id «${params.id}» not exists.`,
        'FilmController'
      );
    }

    if (existFilm.user?.id !== user.id) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        'Only the owner can edit films. ',
        'FilmController'
      );
    }

    await this.filmsService.deleteById(params.id);
    await this.commentService.deleteByFilmId(params.id);
    this.ok(res, true);
  }

  public async search(
    req: Request<unknown, unknown, unknown, SearchFilmsParams>,
    res: Response): Promise<void> {
    const { limit, genre } = req.query;
    const numberLimit = limit ?? MAX_FILMS_COUNT;
    let searchResult;
    if (!genre) {
      searchResult = await this.filmsService.findByLimit(numberLimit);
    }
    else {
      searchResult = await this.filmsService.findByGenre(genre, numberLimit);
    }

    this.send(
      res,
      StatusCodes.OK,
      fillDTO(FilmSearchItem, searchResult)
    );
  }

  public async getPromo(
    _: Request,
    res: Response): Promise<void> {

    const promoFilm = await this.filmsService.findPromo();
    this.ok(res, fillDTO(FilmResponse, promoFilm)
    );
  }

  async getComments(
    {params}: Request<Record<string, string>>,
    res: Response): Promise<void> {
    const comments = await this.commentService.findByFilmId(params.filmId);
    this.ok(res, fillDTO(CommentResponse, comments));
  }

  async getToWatch(req: Request<Record<string, unknown>, Record<string, unknown>>, _res: Response): Promise<void> {
    const {user} = req;
    const result = await this.userService.findToWatch(user.id);
    this.ok(_res, fillDTO(FilmSearchItem, result));
  }

  async postToWatch(req: Request<Record<string, unknown>, Record<string, unknown>, { filmId: string }>, _res: Response): Promise<void> {
    const {body, user} = req;
    await this.userService.addToWatch(body.filmId, user.id);
    this.noContent(_res, {message: 'Успешно. Фильм добавлен в список "К просмотру".'});
  }

  async deleteToWatch(req: Request<Record<string, unknown>, Record<string, unknown>, { filmId: string }>, _res: Response): Promise<void> {
    const {body, user} = req;
    await this.userService.deleteToWatch(body.filmId, user.id);
    this.noContent(_res, {message: 'Успешно. Фильм удален из списка "К просмотру".'});
  }
}
