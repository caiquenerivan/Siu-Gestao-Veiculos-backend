// src/operators/dto/create-operator.dto.ts
import { IsEmail, IsString, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';
// Se você estiver usando validação (recomendado). Se não, remova os decorators.

export class CreateOperatorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  // CAMPO OBRIGATÓRIO PARA A RELAÇÃO
  @IsUUID()
  @IsNotEmpty()
  userId: string; 

  // Campos Opcionais (conforme seu schema)
  @IsOptional()
  company?: string;

  @IsOptional()
  region?: string;

  @IsOptional()
  cpf?: string;

  @IsOptional()
  cnpj?: string;

  // Se 'TipoPessoa' for um Enum no Prisma, aqui recebemos como string ou o próprio Enum
  @IsOptional()
  type?: 'PF' | 'PJ'; 
}