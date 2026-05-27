// сервис авторизации
import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const { password, ...safeUser } = user;
    const token = this.createToken(user);

    return {
      user: safeUser,
      token,
    };
  }

  async me(authorizationHeader?: string) {
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Токен отсутствует');
    }

    const token = authorizationHeader.replace('Bearer ', '');

    try {
      const payload = jwt.verify(token, this.jwtSecret) as unknown as TokenPayload;
      return this.usersService.findOne(Number(payload.sub));
    } catch {
      throw new UnauthorizedException('Некорректный токен');
    }
  }
}