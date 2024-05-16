import { ChatRoom } from '../entities/chatRoom.entity';

export class CreateRoomDto extends ChatRoom {
	name: string;
}
