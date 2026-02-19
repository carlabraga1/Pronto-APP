import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private resetTokens = new Map<string, { email: string; role: string; expiresAt: Date }>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ─── REGISTER ────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const { name, email, password, phoneNumber, role } = dto;

    if (role === 'client') {
      const exists = await this.prisma.user.findUnique({ where: { email } });
      if (exists) throw new ConflictException('Email já cadastrado');

      // const hashed = await bcrypt.hash(password, 10);
      const user = await this.prisma.user.create({
        data: { name, email, password: password, phoneNumber },
      });

      return this.buildResponse(user.id, user.email, 'client', user.name);
    }

    const exists = await this.prisma.professional.findUnique({ where: { email } });
    if (exists) throw new ConflictException('Email já cadastrado');

    const hashed = await bcrypt.hash(password, 10);
    const professional = await this.prisma.professional.create({
      data: { name, email, password: hashed, phoneNumber },
    });

    return this.buildResponse(professional.id, professional.email, 'professional', professional.name);
  }

  // ─── LOGIN ───────────────────────────────────────────────

  async login(dto: LoginDto) {
    const { email, password, role } = dto;

    if (role === 'client') {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) throw new UnauthorizedException('Email ou senha inválidos');

      if (password !== user.password) throw new UnauthorizedException('Email ou senha inválidos');

      return this.buildResponse(user.id, user.email, 'client', user.name);
    }

    const professional = await this.prisma.professional.findUnique({ where: { email } });
    if (!professional) throw new UnauthorizedException('Email ou senha inválidos');

    const valid = password === professional.password
    if (!valid) throw new UnauthorizedException('Email ou senha inválidos');

    return this.buildResponse(professional.id, professional.email, 'professional', professional.name);
  }

  // ─── FORGOT PASSWORD ────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto) {
    const { email, role } = dto;

    if (role === 'client') {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) return { message: 'Se o email existir, enviaremos um link de recuperação' };
    } else {
      const professional = await this.prisma.professional.findUnique({ where: { email } });
      if (!professional) return { message: 'Se o email existir, enviaremos um link de recuperação' };
    }

    const token = this.generateResetToken();
    this.resetTokens.set(token, {
      email,
      role,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min
    });

    await this.sendResetEmail(email, token);

    return { message: 'Se o email existir, enviaremos um link de recuperação' };
  }

  // ─── RESET PASSWORD ─────────────────────────────────────

  async resetPassword(dto: ResetPasswordDto) {
    const { token, newPassword } = dto;

    const data = this.resetTokens.get(token);
    if (!data || data.expiresAt < new Date()) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    if (data.role === 'client') {
      await this.prisma.user.update({
        where: { email: data.email },
        data: { password: hashed },
      });
    } else {
      await this.prisma.professional.update({
        where: { email: data.email },
        data: { password: hashed },
      });
    }

    this.resetTokens.delete(token);

    return { message: 'Senha alterada com sucesso' };
  }

  // ─── HELPERS ─────────────────────────────────────────────

  private buildResponse(id: number, email: string, role: 'client' | 'professional', name: string) {
    const payload: JwtPayload = { sub: id, email, role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id, email, name, role },
    };
  }

  private generateResetToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  private async sendResetEmail(email: string, token: string) {
    const resetLink = `${process.env.APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.mailtrap.io',
      port: Number(process.env.MAIL_PORT) || 587,
      auth: {
        user: process.env.MAIL_USER || '',
        pass: process.env.MAIL_PASS || '',
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM || '"Pronto App" <noreply@prontoapp.com>',
      to: email,
      subject: 'Recuperação de Senha - Pronto App',
      html: `
        <h2>Recuperação de Senha</h2>
        <p>Você solicitou a redefinição da sua senha.</p>
        <p>Use o código abaixo para redefinir sua senha:</p>
        <h3 style="background:#f0f0f0;padding:10px;text-align:center;letter-spacing:2px;">${token}</h3>
        <p>Este link expira em 30 minutos.</p>
        <p>Se você não solicitou, ignore este email.</p>
      `,
    });
  }
}
