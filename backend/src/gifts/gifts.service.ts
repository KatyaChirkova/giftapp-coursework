// выполняет основную логику работы с подарками
import { Injectable, NotFoundException } from '@nestjs/common';
import { pool } from '../database';
import { Gift } from './gift.interface';

@Injectable()
export class GiftsService {
  async findAll(): Promise<Gift[]> {
    const result = await pool.query(`
      SELECT
        gifts.id,
        gifts.title,
        gifts.description,
        gifts.price,
        gifts.category_id,
        categories.name AS category_name,
        gifts.created_by
      FROM gifts
      JOIN categories ON gifts.category_id = categories.id
      ORDER BY gifts.id
    `);

    return result.rows;
  }

  async create(gift: Omit<Gift, 'id'>): Promise<Gift> {
    const result = await pool.query(
      `
      INSERT INTO gifts (title, description, price, category_id, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        gift.title,
        gift.description,
        gift.price,
        gift.category_id,
        gift.created_by,
      ],
    );

    return result.rows[0];
  }

  async remove(id: number) {
    const result = await pool.query(
      'DELETE FROM gifts WHERE id = $1 RETURNING *',
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Подарок с id ${id} не найден`);
    }

    return { message: 'Подарок удален' };
  }
}