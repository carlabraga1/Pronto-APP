import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  @SubscribeMessage('join_request_chat')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: number },
  ) {
    const room = `request_${data.orderId}`;
    client.join(room);
    client.emit('joined', { room });
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      orderId: number;
      text: string;
      senderType: 'CLIENT' | 'PROFESSIONAL';
      senderId: number;
    },
  ) {
    try {
      const message = await this.chatService.sendMessage(
        data.orderId,
        data.text,
        data.senderType,
        data.senderId,
      );

      const room = `request_${data.orderId}`;
      this.server.to(room).emit('new_message', message);
    } catch (error: any) {
      client.emit('error', { message: error.message });
    }
  }
}
