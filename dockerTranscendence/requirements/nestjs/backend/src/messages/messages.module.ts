import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { TypeOrmModule } from '@nestjs/typeorm'; // Import TypeOrmModule
import { Message } from './entities/message.entity'; // Import the Message entity
import { ChatRoom } from './entities/chatRoom.entity';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/services/users/users.service';


@Module({
  imports: [TypeOrmModule.forFeature([Message, ChatRoom]), UsersModule], // Include TypeOrmModule.forFeature
  providers: [MessagesGateway, MessagesService],
  exports: [MessagesGateway, MessagesService],
})
export class MessagesModule { }


//to add more typeormmodules in here