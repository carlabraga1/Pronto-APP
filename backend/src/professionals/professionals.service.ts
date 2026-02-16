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

  async syncCategories(
    categories: { name: string; icon: string; subcategories?: { name: string; icon: string }[] }[],
  ) {
    for (const cat of categories) {
      const category = await this.prisma.serviceCategory.upsert({
        where: { name: cat.name },
        update: { icon: cat.icon },
        create: { name: cat.name, icon: cat.icon },
      });

      if (cat.subcategories) {
        for (const sub of cat.subcategories) {
          const existing = await this.prisma.serviceSubcategory.findFirst({
            where: { name: sub.name, categoryId: category.id },
          });
          if (existing) {
            await this.prisma.serviceSubcategory.update({
              where: { id: existing.id },
              data: { icon: sub.icon },
            });
          } else {
            await this.prisma.serviceSubcategory.create({
              data: { name: sub.name, icon: sub.icon, categoryId: category.id },
            });
          }
        }
      }
    }

    return this.getCategories();
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
