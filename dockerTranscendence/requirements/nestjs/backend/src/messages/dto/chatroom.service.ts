import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateRoomDto } from "./create-chatroom.dto";
import { ChatRoom } from "../entities/chatRoom.entity";

@Injectable()
export class ChatRoomService {
	constructor(
		@InjectRepository(ChatRoom)
		private readonly chatroomRepository: Repository<ChatRoom>,
	) {}

	async createChatRoom(CreateRoomDto: CreateRoomDto) {
		const chatroom = this.chatroomRepository.create(CreateRoomDto);
		return this.chatroomRepository.save(chatroom);
	}
}