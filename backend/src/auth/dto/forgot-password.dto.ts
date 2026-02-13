import { IsEmail, IsIn } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email: string;

  @IsIn(['client', 'professional'])
  role: 'client' | 'professional';
}
