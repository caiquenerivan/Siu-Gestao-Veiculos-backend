import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminsService {
  constructor(private prisma: PrismaService) {}

  // 1. CREATE (Transação)
  async create(data: CreateAdminDto) {
    // Verifica se o email já existe na tabela pai (User)
    const userExists = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (userExists) throw new BadRequestException('Email já cadastrado no sistema.');

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Cria User + Admin atomicamente
    return this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: UserRole.ADMIN, // Importante: Define a Role correta
        },
      });

      return tx.admin.create({
        data: {
          company: data.company,
          region: data.region,
          cpfCnpj: data.cpfCnpj,
          userId: newUser.id, // Vincula ao pai
        },
        include: {
          user: { // Retorna os dados do usuário criado, menos a senha
            select: { id: true, name: true, email: true, role: true }
          }
        },
      });
    });
  }

  // 2. FIND ALL
  async findAll() {
    return this.prisma.admin.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true, // Para saber se está bloqueado
          },
        },
      },
    });
  }

  // 3. FIND ONE
  async findOne(id: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    if (!admin) throw new NotFoundException('Administrador não encontrado.');
    return admin;
  }

  // 4. UPDATE
  async update(id: string, data: UpdateAdminDto) {
    await this.findOne(id); // Garante que existe

    // Separa dados do User (Pai) dos dados do Admin (Filho)
    const { name, email, password, isActive, ...adminData } = data;

    // Se houver senha nova, faz o hash (opcional)
    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    return this.prisma.admin.update({
      where: { id },
      data: {
        // Atualiza campos específicos do Admin
        ...adminData,
        
        // Atualiza campos do User (Pai) via relacionamento
        user: {
          update: {
            ...(name && { name }),
            ...(email && { email }),
            ...(isActive !== undefined && { isActive }),
            ...(hashedPassword && { password: hashedPassword }),
          },
        },
      },
      include: { user: { select: { name: true, email: true, isActive: true } } },
    });
  }

  // 5. REMOVE
  async remove(id: string) {
    const admin = await this.findOne(id);
    
    // Deletamos o USUÁRIO (Pai). 
    // Como configuramos "onDelete: Cascade" no schema, o registro em 'admins' some junto.
    return this.prisma.user.delete({
      where: { id: admin.userId },
    });
  }
}