import { IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Имя обязательно для заполнения' })
  name: string;

  @IsEmail({}, { message: 'Email должен быть корректным' })
  email: string;

  @IsOptional()
  @IsInt({ message: 'Возраст должен быть целым числом' })
  @Min(0, { message: 'Возраст не может быть отрицательным' })
  age?: number;

  @IsString()
  @MinLength(4, { message: 'Пароль должен быть не короче 4 символов' })
  password: string;

  @IsOptional()
  @IsIn(['user', 'admin'], { message: 'Роль должна быть user или admin' })
  role?: 'user' | 'admin';
}