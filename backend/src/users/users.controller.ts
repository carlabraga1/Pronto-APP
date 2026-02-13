import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto/update-profile.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getProfile(@Req() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  @Patch('me')
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Post('me/change-password')
  changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.id, dto);
  }

  @Get('me/login-activities')
  getLoginActivities(@Req() req: any) {
    return this.usersService.getLoginActivities(req.user.id);
  }

  @Delete('me/sessions')
  endAllSessions(@Req() req: any) {
    return this.usersService.endAllSessions(req.user.id);
  }

  @Delete('me')
  deleteAccount(@Req() req: any) {
    return this.usersService.deleteAccount(req.user.id);
  }
}
