// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Lê quais roles são exigidas na rota ou na classe
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. Se a rota não exige role nenhuma, deixa passar
    if (!requiredRoles) {
      return true;
    }

    // 3. Pega o usuário que o AuthGuard('jwt') já validou e colocou no request
    const { user } = context.switchToHttp().getRequest();

    // 4. Verifica se o usuário tem a role necessária
    // OBS: Certifique-se que o seu JWT Strategy está retornando o campo 'role' no user
    return requiredRoles.some((role) => user.role === role);
  }
}