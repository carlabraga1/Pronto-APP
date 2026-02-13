import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async findRequests(status?: string) {
    return this.prisma.order.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true, email: true } },
        professional: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
      },
    });
  }

  async acceptRequest(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Pedido não encontrado');
    if (order.status !== 'PROCURANDO') {
      throw new BadRequestException('Pedido não está aguardando aceitação');
    }

    // Pega um profissional ativo aleatório da categoria do pedido
    const professionals = await this.prisma.professional.findMany({
      where: { isActive: true, categoryId: order.categoryId },
      orderBy: { rating: 'desc' },
      take: 1,
    });

    if (professionals.length === 0) {
      throw new BadRequestException('Nenhum profissional disponível para esta categoria');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'ACEITO',
        professionalId: professionals[0].id,
      },
      include: {
        client: { select: { id: true, name: true } },
        professional: { select: { id: true, name: true, rating: true } },
        category: { select: { id: true, name: true } },
      },
    });

    return {
      ...updated,
      statusLabel: 'ACCEPTED',
    };
  }
}
