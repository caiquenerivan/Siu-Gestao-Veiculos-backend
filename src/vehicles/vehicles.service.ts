import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  // 1. CREATE
  async create(data: CreateVehicleDto) {
    // Verifica duplicidade de placa
    const vehicleExists = await this.prisma.vehicle.findUnique({
      where: { plate: data.plate },
    });

    if (vehicleExists) {
      throw new BadRequestException('Já existe um veículo com esta placa.');
    }

    return this.prisma.vehicle.create({
      data: {
        plate: data.plate,
        model: data.model,
        brand: data.brand,
        color: data.color,
        status: data.status, // Se vier nulo, usa o default do banco
        ownerName: data.ownerName,
        // Converte string ISO para Date object
        licensingDate: new Date(data.licensingDate), 
      },
    });
  }

  // 2. FIND ALL
  async findAll() {
    return this.prisma.vehicle.findMany({
      include: {
        // Mostra quem está dirigindo o carro no momento (se houver)
        driver: {
          select: {
            id: true,
            user: { select: { name: true } } // Pega o nome do motorista via relação User
          }
        }
      }
    });
  }

  // 3. FIND ONE
  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        driver: {
          include: { user: { select: { name: true, email: true } } }
        }
      }
    });

    if (!vehicle) throw new NotFoundException('Veículo não encontrado');
    return vehicle;
  }

  // 4. UPDATE
  async update(id: string, data: UpdateVehicleDto) {
    await this.findOne(id); // Garante que existe

    // Se estiver tentando mudar a placa, verifica se a nova já não existe
    if (data.plate) {
      const plateExists = await this.prisma.vehicle.findUnique({
        where: { plate: data.plate },
      });
      // Verifica se existe E se não é o próprio carro que estamos editando
      if (plateExists && plateExists.id !== id) {
        throw new BadRequestException('Esta placa já está em uso por outro veículo.');
      }
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: {
        ...data,
        // Se a data vier, converte. Se não, undefined.
        licensingDate: data.licensingDate ? new Date(data.licensingDate) : undefined,
      },
    });
  }

  // 5. REMOVE
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.vehicle.delete({ where: { id } });
  }
}