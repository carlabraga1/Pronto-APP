import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('requests')
  findRequests(@Query('status') status?: string) {
    return this.adminService.findRequests(status);
  }

  @Patch('requests/:id/accept')
  acceptRequest(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.acceptRequest(id);
  }
}
