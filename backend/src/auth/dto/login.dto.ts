import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email должен быть корректным' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Пароль обязателен' })
  password: string;
}