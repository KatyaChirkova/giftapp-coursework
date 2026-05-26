import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { pool } from '../database';
import { CreateUserDto } from './dto/create-user.dto';
import { SafeUser, User } from './user.interface';

@Injectable()
export class UsersService {
  private toSafeUser(user: User): SafeUser {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async findAll(): Promise<SafeUser[]> {
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    return result.rows.map((user) => this.toSafeUser(user));
  }

  async findOne(id: number): Promise<SafeUser> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Пользователь с id ${id} не найден`);
    }

    return this.toSafeUser(result.rows[0]);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  async create(createUserDto: CreateUserDto): Promise<SafeUser> {
    const existingUser = await this.findByEmail(createUserDto.email);

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

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
        createUserDto.password,
        createUserDto.role ?? 'user',
      ],
    );

    return this.toSafeUser(result.rows[0]);
  }

  async remove(id: number) {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Пользователь с id ${id} не найден`);
    }

    return { message: 'Пользователь удален' };
  }
}