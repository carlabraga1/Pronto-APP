import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfessionalsService {
  constructor(private prisma: PrismaService) {}

  async getCategories() {
    return this.prisma.serviceCategory.findMany({
      include: { subcategories: true },
      orderBy: { name: 'asc' },
    });
  }

  async findAll(category?: string) {
    return this.prisma.professional.findMany({
      where: {
        isActive: true,
        ...(category && {
          category: { name: { contains: category, mode: 'insensitive' as const } },
        }),
      },
      orderBy: { rating: 'desc' },
      select: {
        id: true,
        name: true,
        profileImage: true,
        bio: true,
        city: true,
        rating: true,
        reviewCount: true,
        completedServices: true,
        responseTime: true,
        verified: true,
        servicePrice: true,
        category: { select: { id: true, name: true, icon: true } },
      },
    });
  }

  async findOne(id: number) {
    const professional = await this.prisma.professional.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        profileImage: true,
        bio: true,
        city: true,
        rating: true,
        reviewCount: true,
        completedServices: true,
        responseTime: true,
        verified: true,
        servicePrice: true,
        memberSince: true,
        category: { select: { id: true, name: true, icon: true } },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            client: { select: { name: true, profileImage: true } },
          },
        },
      },
    });

    if (!professional) throw new NotFoundException('Profissional não encontrado');
    return professional;
  }
}
