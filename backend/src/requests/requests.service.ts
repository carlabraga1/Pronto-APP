import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto, UpdateStatusDto, AssignProfessionalDto } from './dto/create-request.dto';

// Mapeamento de status para o frontend
const STATUS_MAP = {
  PROCURANDO: 'WAITING_ACCEPTANCE',
  AGUARDANDO: 'WAITING_ACCEPTANCE',
  ACEITO: 'ACCEPTED',
  A_CAMINHO: 'ON_THE_WAY',
  INICIADO: 'IN_PROGRESS',
  FINALIZADO: 'DONE',
  CANCELADO: 'CANCELLED',
} as const;

function mapStatus(order: any) {
  return {
    ...order,
    statusLabel: STATUS_MAP[order.status as keyof typeof STATUS_MAP] || order.status,
  };
}

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateRequestDto) {
    const order = await this.prisma.order.create({
      data: {
        description: dto.description,
        address: dto.address,
        status: 'PROCURANDO',
        schedule: dto.schedule || 'NOW',
        scheduledTime: dto.scheduledTime ? new Date(dto.scheduledTime) : null,
        clientId: userId,
        categoryId: dto.categoryId,
        subcategoryId: dto.subcategoryId || null,
      },
      include: {
        category: { select: { id: true, name: true, icon: true } },
        subcategory: { select: { id: true, name: true } },
      },
    });

    return mapStatus(order);
  }

  async assign(orderId: number, dto: AssignProfessionalDto) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    if (order.status !== 'PROCURANDO') {
      throw new BadRequestException('Pedido já foi atribuído');
    }

    const professional = await this.prisma.professional.findUnique({
      where: { id: dto.professionalId },
    });
    if (!professional) throw new NotFoundException('Profissional não encontrado');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        professionalId: dto.professionalId,
        status: 'ACEITO',
      },
      include: {
        professional: { select: { id: true, name: true, profileImage: true, phoneNumber: true, rating: true } },
        category: { select: { id: true, name: true, icon: true } },
      },
    });

    return mapStatus(updated);
  }

  async updateStatus(orderId: number, dto: UpdateStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Pedido não encontrado');

    const validTransitions: Record<string, string[]> = {
      PROCURANDO: ['ACEITO', 'CANCELADO'],
      ACEITO: ['A_CAMINHO', 'CANCELADO'],
      A_CAMINHO: ['INICIADO', 'CANCELADO'],
      INICIADO: ['FINALIZADO', 'CANCELADO'],
    };

    const allowed = validTransitions[order.status] || [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Não é possível mudar de ${order.status} para ${dto.status}`,
      );
    }

    const timestamps: any = {};
    if (dto.status === 'INICIADO') timestamps.startedAt = new Date();
    if (dto.status === 'FINALIZADO') timestamps.completedAt = new Date();
    if (dto.status === 'CANCELADO') timestamps.canceledAt = new Date();

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status, ...timestamps },
      include: {
        professional: { select: { id: true, name: true, profileImage: true, rating: true } },
        category: { select: { id: true, name: true, icon: true } },
        subcategory: { select: { id: true, name: true } },
      },
    });

    return mapStatus(updated);
  }

  async findOne(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: { select: { id: true, name: true, profileImage: true } },
        professional: {
          select: {
            id: true, name: true, profileImage: true, phoneNumber: true,
            rating: true, bio: true, city: true,
            category: { select: { name: true } },
          },
        },
        category: { select: { id: true, name: true, icon: true } },
        subcategory: { select: { id: true, name: true } },
      },
    });

    if (!order) throw new NotFoundException('Pedido não encontrado');
    return mapStatus(order);
  }

  async findMyRequests(userId: number) {
    const orders = await this.prisma.order.findMany({
      where: { clientId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        professional: { select: { id: true, name: true, profileImage: true, rating: true } },
        category: { select: { id: true, name: true, icon: true } },
        subcategory: { select: { id: true, name: true } },
      },
    });

    return orders.map(mapStatus);
  }
}
