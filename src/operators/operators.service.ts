import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// Certifique-se de que seu DTO tem name, email, password e os dados do operador
import { CreateOperatorDto } from './dto/create-operator.dto'; 
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { UpdateOperatorDto } from './dto/update-operator.dto';

@Injectable()
export class OperatorsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateOperatorDto) {
    // Verifica email duplicado na tabela USER
    const userExists = await this.prisma.user.findUnique({ 
        where: { email: data.email } 
    });
    if (userExists) throw new BadRequestException('Email já cadastrado');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Transação: Cria User + Operator
    return this.prisma.$transaction(async (tx) => {
      // 1. Cria o Usuário base
      const newUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: UserRole.OPERADOR, // Define a role fixa
        },
      });

      // 2. Cria o Operador vinculado
      return tx.operator.create({
        data: {
          type: data.type,       // Ex: CLT, PJ
          company: data.company,
          region: data.region,
          cpf: data.cpf,
          cnpj: data.cnpj,
          userId: newUser.id,    // Vínculo
        },
        include: { user: true },
      });
    });
  }
  
  // ... resto dos métodos (findAll, etc)


  // 2. FIND ALL
  async findAll() {
    return this.prisma.operator.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, isActive: true } },
      },
    });
  }

  // 3. FIND ONE
  async findOne(id: string) {
    const operator = await this.prisma.operator.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, isActive: true } },
      },
    });

    if (!operator) throw new NotFoundException('Operador não encontrado');
    return operator;
  }

  // 4. UPDATE
  async update(id: string, data: UpdateOperatorDto) {
    await this.findOne(id);

    const { name, email, password, isActive, ...operatorData } = data;

    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    return this.prisma.operator.update({
      where: { id },
      data: {
        ...operatorData,
        user: {
          update: {
            ...(name && { name }),
            ...(email && { email }),
            ...(isActive !== undefined && { isActive }),
            ...(hashedPassword && { password: hashedPassword }),
          },
        },
      },
      include: { user: true },
    });
  }

  // 5. REMOVE
  async remove(id: string) {
    const operator = await this.findOne(id);
    // Deleta o Pai (User), o Cascade deleta o Operador
    return this.prisma.user.delete({
      where: { id: operator.userId },
    });
  }
}