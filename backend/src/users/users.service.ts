// содержит логику работы с пользователями и обращается к базе данных
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { pool } from '../database';
import { CreateUserDto } from './dto/create-user.dto';
import { SafeUser, User } from './user.interface';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('USERS');

  private toSafeUser(user: User): SafeUser {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async findAll(): Promise<SafeUser[]> {
    this.logger.log('Получение списка пользователей');

    const result = await pool.query('SELECT * FROM users ORDER BY id');
    return result.rows.map((user) => this.toSafeUser(user));
  }

  async findOne(id: number): Promise<SafeUser> {
    this.logger.log(`Поиск пользователя id=${id}`);

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      this.logger.warn(`Пользователь с id ${id} не найден`);
      throw new NotFoundException(`Пользователь с id ${id} не найден`);
    }

    return this.toSafeUser(result.rows[0]);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    this.logger.log(`Поиск пользователя по email: ${email}`);

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);

    return result.rows[0];
  }

  async create(createUserDto: CreateUserDto): Promise<SafeUser> {
    this.logger.log(`Создание пользователя: ${createUserDto.email}`);

    const existingUser = await this.findByEmail(createUserDto.email);

    if (existingUser) {
      this.logger.warn(`Пользователь уже существует: ${createUserDto.email}`);
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (name, email, age, password, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        createUserDto.name,
        createUserDto.email,
        createUserDto.age ?? null,
        passwordHash,
        createUserDto.role ?? 'user',
      ],
    );

    this.logger.log(`Пользователь создан: ${createUserDto.email}`);

    return this.toSafeUser(result.rows[0]);
  }

  async remove(id: number) {
    this.logger.log(`Удаление пользователя id=${id}`);

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [id],
    );

    if (result.rows.length === 0) {
      this.logger.warn(`Пользователь с id ${id} не найден`);
      throw new NotFoundException(`Пользователь с id ${id} не найден`);
    }

    return { message: 'Пользователь удален' };
  }
}