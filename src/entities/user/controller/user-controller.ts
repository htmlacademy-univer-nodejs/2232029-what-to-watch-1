import {inject, injectable} from 'inversify';
import {Request, Response} from 'express';
import {StatusCodes} from 'http-status-codes';
import {Component} from '../../../models/component.js';
import {ILogger} from '../../../common/logger/logger-interface.js';
import {Controller} from '../../../common/controller/controller.js';
import {IUserService} from '../service/user-service-interface.js';
import {IConfig} from '../../../common/config/config-interface.js';
import {HttpMethod} from '../../../models/http-method.js';
import CreateUserDto from '../dto/create-user-dto.js';
import {createJWT, fillDTO} from '../../../utils/common.js';
import UserResponse from '../response/user-response.js';
import HttpError from '../../../common/errors/http-error.js';
import LoginUserDto from '../dto/login-user-dto.js';
import {ValidateDtoMiddleware} from '../../../common/middlewares/validate-dto-middleware.js';
import {JWT_ALGORITHM} from '../user-constants.js';
import LoggedUserResponse from '../response/user-logger-response.js';
import {UploadFileMiddleware} from '../../../common/middlewares/upload-file-middleware.js';

@injectable()
export default class UserController extends Controller {
  constructor(
    @inject(Component.ILogger) logger: ILogger,
    @inject(Component.IUserService) private readonly userService: IUserService,
    @inject(Component.IConfig) private readonly configService: IConfig,
  ) {
    super(logger);
    this.logger.info('Register routes for UserController…');

    this.addRoute({
      path: '/register',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [new ValidateDtoMiddleware(CreateUserDto)]
    });

    this.addRoute({
      path: '/',
      method: HttpMethod.Get,
      handler: this.get
    });

    this.addRoute({
      path: '/login',
      method: HttpMethod.Post,
      handler: this.login,
      middlewares: [new ValidateDtoMiddleware(LoginUserDto)]
    });
    this.addRoute({
      path: '/avatar',
      method: HttpMethod.Post,
      handler: this.uploadAvatar,
      middlewares: [
        new UploadFileMiddleware(this.configService.get('UPLOAD_DIRECTORY'), 'file')]
    });
  }

  public async create(
    {body, user}: Request<Record<string, unknown>, Record<string, unknown>, CreateUserDto>,
    res: Response,
  ): Promise<void> {
    if (user) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        'Only anonymous clients can create new users.',
        'UserController'
      );
    }
    const existsUser = await this.userService.findByEmail(body.email);

    if (existsUser) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        `User with email «${body.email}» exists.`,
        'UserController'
      );
    }

    const result = await this.userService.create(body, this.configService.get('SALT'));
    this.send(
      res,
      StatusCodes.CREATED,
      fillDTO(UserResponse, result)
    );
  }

  public async login(
    {body}: Request<Record<string, unknown>, Record<string, unknown>, LoginUserDto>,
    _res: Response,
  ): Promise<void> {
    const user = await this.userService.verifyUser(body, this.configService.get('SALT'));
    if (!user) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized',
        'UserController'
      );
    }
    const token = await createJWT(
      JWT_ALGORITHM,
      this.configService.get('JWT_SECRET'),
      { id: user.id, email: user.email }
    );
    this.ok(_res, fillDTO(LoggedUserResponse, {email: user?.email, token}));
  }

  async uploadAvatar(req: Request, res: Response) {
    if (!req.user) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'User must be authorised',
        'UsersController'
      );
    }
    const user = await this.userService.findByEmail(req.user.email);
    if (!user) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        'User doesn\'t exist',
        'UsersController'
      );
    }
    if (req.file) {
      const createdFileName = req.file.filename;
      await this.userService.setUserAvatarPath(req.params.userId, createdFileName);
      this.created(res, {
        avatarPath: createdFileName
      });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized',
        'UserController'
      );
    }

    const user = await this.userService.findByEmail(req.user.email);
    this.ok(res, fillDTO(LoggedUserResponse, user));
  }
}
