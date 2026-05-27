// принимает запросы для получения, добавления и удаления подарков
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { GiftsService } from './gifts.service';

@Controller('gifts')
export class GiftsController {
  constructor(private readonly giftsService: GiftsService) {}

  @Get()
  findAll() {
    return this.giftsService.findAll();
  }

  @Post()
  create(@Body() gift: any) {
    return this.giftsService.create(gift);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.giftsService.remove(id);
  }
}