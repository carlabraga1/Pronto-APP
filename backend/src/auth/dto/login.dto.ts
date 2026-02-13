import { IsEmail, IsString, IsIn } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsIn(['client', 'professional'])
  role: 'client' | 'professional';
}
