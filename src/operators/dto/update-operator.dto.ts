import { PartialType } from '@nestjs/mapped-types';
import { CreateOperatorDto } from './create-operator.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateOperatorDto extends PartialType(CreateOperatorDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
