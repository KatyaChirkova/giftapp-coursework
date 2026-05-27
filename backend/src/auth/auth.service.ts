// сервис авторизации
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

type TokenPayload = {
  sub: number;
  email: string;
  role: string;
};

@Injectable()
export class AuthService {
  private readonly jwtSecret = 'giftapp_secret_key';
  private readonly logger = new Logger('AUTH');

  constructor(private readonly usersService: UsersService) {}

  private createToken(user: any) {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      this.jwtSecret,
      {
        expiresIn: '7d',
      },
    );
  }

  async login(loginDto: LoginDto) {
    this.logger.log(`Попытка входа: ${loginDto.email}`);

    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      this.logger.warn(`Пользователь не найден: ${loginDto.email}`);
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      this.logger.warn(`Неверный пароль: ${loginDto.email}`);
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const { password, ...safeUser } = user;
    const token = this.createToken(user);

    this.logger.log(`Успешный вход: ${loginDto.email}`);

    return {
      user: safeUser,
      token,
    };
  }

  async me(authorizationHeader?: string) {
    this.logger.log('Проверка JWT-токена');

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      this.logger.warn('Токен отсутствует');
      throw new UnauthorizedException('Токен отсутствует');
    }

    const token = authorizationHeader.replace('Bearer ', '');

    try {
      const payload = jwt.verify(
        token,
        this.jwtSecret,
      ) as unknown as TokenPayload;

      this.logger.log(`Токен действителен для пользователя: ${payload.email}`);

      return this.usersService.findOne(Number(payload.sub));
    } catch {
      this.logger.warn('Некорректный или просроченный токен');
      throw new UnauthorizedException('Некорректный токен');
    }
  }
}