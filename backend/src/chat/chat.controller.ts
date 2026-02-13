import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';

@UseGuards(JwtAuthGuard)
@Controller('requests')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get(':id/chat')
  getChat(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.getOrCreateChat(id);
  }
}
