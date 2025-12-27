/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class SigninDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  password: string;
}
