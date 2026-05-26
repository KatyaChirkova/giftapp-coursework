import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { GiftsModule } from './gifts/gifts.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule, AuthModule, GiftsModule],
})
export class AppModule {}