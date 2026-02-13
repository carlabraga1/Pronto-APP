import { IsString, IsInt, IsOptional, IsEnum } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  description: string;

  @IsString()
  address: string;

  @IsInt()
  categoryId: number;

  @IsOptional()
  @IsInt()
  subcategoryId?: number;

  @IsOptional()
  @IsEnum(['NOW', 'SCHEDULED'])
  schedule?: 'NOW' | 'SCHEDULED';

  @IsOptional()
  @IsString()
  scheduledTime?: string;
}

export class UpdateStatusDto {
  @IsEnum(['ACEITO', 'A_CAMINHO', 'INICIADO', 'FINALIZADO', 'CANCELADO'])
  status: 'ACEITO' | 'A_CAMINHO' | 'INICIADO' | 'FINALIZADO' | 'CANCELADO';
}

export class AssignProfessionalDto {
  @IsInt()
  professionalId: number;
}
