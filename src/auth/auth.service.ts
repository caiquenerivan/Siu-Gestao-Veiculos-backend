/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    // 1. Verificar se o email já existe
    const userExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (userExists) {
      throw new BadRequestException('Email já está em uso');
    }

    // 2. Criptografar a senha (Hash)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    // 3. Criar o Usuário e o Perfil de Admin ao mesmo tempo (Transação)
    try {
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          role: 'ADMIN', // Por enquanto, vamos forçar a criação de ADMIN
          // Aqui usamos a relação do Prisma para criar o Admin junto
          admin: {
            create: {
              name: dto.name,
              company: dto.company,
              region: dto.region,
              cpfCnpj: dto.cpfCnpj,
            },
          },
        },
        // Selecionamos o que queremos retornar (para não devolver a senha)
        select: {
          id: true,
          email: true,
          role: true,
          admin: {
            select: {
              name: true,
              company: true,
            },
          },
        },
      });

      return user;
    } catch (error) {
      // Log do erro para você ver no terminal se algo der errado
      console.error(error);
      throw new BadRequestException('Erro ao criar usuário');
    }
  }

  // --- NOVO MÉTODO: SIGNIN ---
  async signin(dto: SigninDto) {
    // 1. Busca o usuário
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // 2. Compara a senha
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // 3. Gera o Token JWT
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    // Busca o usuário no banco (ajuste conforme seu UsersService)
    // Se você usa o UsersService:
    // const user = await this.usersService.findByEmail(email); 
    
    // Se você usa Prisma direto aqui:
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // 1. Valida as credenciais do Operador
  async validateOperator(email: string, pass: string): Promise<any> {
    const operator = await this.prisma.operator.findUnique({
      where: { email },
    });

    // Verifica se operador existe E se a senha bate com o Hash
    if (operator && (await bcrypt.compare(pass, operator.password))) {
      const { password, ...result } = operator;
      return result;
    }
    return null;
  }

  // 2. Gera o Token JWT específico para Operador
  async loginOperator(operator: any) {
    const payload = { 
      email: operator.email, 
      sub: operator.id, 
      role: operator.role || 'OPERATOR', // Garante que o token tenha a Role
      type: 'OPERATOR' // Útil para o frontend saber quem logou
    };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
