import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateChat(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, clientId: true, professionalId: true },
    });

    if (!order) throw new NotFoundException('Pedido não encontrado');

    const acceptedStatuses = ['ACEITO', 'A_CAMINHO', 'INICIADO', 'FINALIZADO'];
    if (!acceptedStatuses.includes(order.status)) {
      throw new BadRequestException('Chat disponível apenas após aceitação do pedido');
    }

    let chat = await this.prisma.chat.findUnique({
      where: { orderId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            text: true,
            senderType: true,
            createdAt: true,
            userId: true,
            professionalId: true,
          },
        },
      },
    });

    if (!chat) {
      chat = await this.prisma.chat.create({
        data: { orderId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              text: true,
              senderType: true,
              createdAt: true,
              userId: true,
              professionalId: true,
            },
          },
        },
      });
    }

    return chat;
  }

  async sendMessage(
    orderId: number,
    text: string,
    senderType: 'CLIENT' | 'PROFESSIONAL',
    senderId: number,
  ) {
    const chat = await this.getOrCreateChat(orderId);

    const message = await this.prisma.message.create({
      data: {
        text,
        senderType,
        orderId,
        chatId: chat.id,
        ...(senderType === 'CLIENT'
          ? { userId: senderId }
          : { professionalId: senderId }),
      },
      select: {
        id: true,
        text: true,
        senderType: true,
        createdAt: true,
        userId: true,
        professionalId: true,
      },
    });

    return message;
  }
}
