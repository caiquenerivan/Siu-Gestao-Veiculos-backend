import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // <--- 1. Torna o módulo visível para a aplicação inteira
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // <--- 2. Permite que outros módulos usem este serviço
})
export class PrismaModule {}
