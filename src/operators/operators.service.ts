import { Injectable } from '@nestjs/common';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { PrismaService } from '../prisma/prisma.service';
import { TipoPessoa } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OperatorsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateOperatorDto) {
    const { userId, type, password, ...rest } = data;
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.operator.create({
      data: {
        ...rest,
        password: hashedPassword,
        type: type? (type as TipoPessoa) : null,
        user: {
          connect: { id: userId },
        },
      }
    });
  }

  findAll() {
    return this.prisma.operator.findMany();
  }

  findOne(id: string) {
    return this.prisma.operator.findUnique({
      where: { id },
    });
  }

  update(id: string, updateOperatorDto: UpdateOperatorDto) {
    return this.prisma.operator.update({
      where: { id },
      data: updateOperatorDto,
    });
  }

  remove(id: string) {
    return this.prisma.operator.delete({
      where: { id },
    });
  }
}
