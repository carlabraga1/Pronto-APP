import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ─── GET PROFILE ──────────────────────────────────────────

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        profileImage: true,
        rating: true,
        createdAt: true,
        addresses: {
          where: { isDefault: true },
          take: 1,
          select: {
            id: true,
            label: true,
            street: true,
            number: true,
            city: true,
            state: true,
          },
        },
        favorites: {
          select: {
            id: true,
            subcategory: {
              select: {
                id: true,
                name: true,
                icon: true,
              },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    return {
      ...user,
      address: user.addresses[0] || null,
      addresses: undefined,
    };
  }

  // ─── UPDATE PROFILE ───────────────────────────────────────

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id: userId } },
      });
      if (existing) throw new ConflictException('Email já está em uso');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.email && { email: dto.email }),
        ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber }),
        ...(dto.profileImage !== undefined && { profileImage: dto.profileImage }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        profileImage: true,
        rating: true,
      },
    });

    return user;
  }

  // ─── CHANGE PASSWORD ──────────────────────────────────────

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new UnauthorizedException('Senha atual incorreta');

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return { message: 'Senha alterada com sucesso' };
  }

  // ─── LOGIN ACTIVITIES ─────────────────────────────────────

  async getLoginActivities(userId: number) {
    return this.prisma.loginActivity.findMany({
      where: { userId },
      orderBy: { loginTime: 'desc' },
      take: 10,
      select: {
        id: true,
        device: true,
        location: true,
        ipAddress: true,
        loginTime: true,
        isActive: true,
      },
    });
  }

  async endAllSessions(userId: number) {
    await this.prisma.loginActivity.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    return { message: 'Todas as sessões foram encerradas' };
  }

  // ─── DELETE ACCOUNT ───────────────────────────────────────

  async deleteAccount(userId: number) {
    await this.prisma.user.delete({ where: { id: userId } });
    return { message: 'Conta excluída com sucesso' };
  }
}
