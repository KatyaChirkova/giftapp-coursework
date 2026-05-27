// описывает, какие поля есть у пользователя
export type UserRole = 'user' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  password: string;
  role: UserRole;
}

export type SafeUser = Omit<User, 'password'>;