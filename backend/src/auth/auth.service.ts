// сервис авторизации
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user || user.password !== loginDto.password) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const { password, ...safeUser } = user;
    return safeUser;
  }
}