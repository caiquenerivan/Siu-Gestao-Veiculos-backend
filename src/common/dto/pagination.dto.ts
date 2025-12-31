// src/common/dto/pagination.dto.ts
import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number) // Transforma "1" (string) em 1 (number)
  @IsNumber()
  @Min(1)
  page?: number = 1; // Valor padrão: Página 1

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10; // Valor padrão: 10 itens por página
}