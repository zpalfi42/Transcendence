import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ChatRoom } from './chatRoom.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number; // Primary key and auto-generated
  @Column({ nullable: true })
  name: string;
  @Column({ nullable: true })
  userid: number;
  @Column()
  message: string;
  @Column()
  timestamp: string;
  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.messages)
  chatRoom: ChatRoom;
}

// @Entity()
// export class ChatRoom {
//   @PrimaryGeneratedColumn()
//   roomId: number;
//   @Column()
//   roomName: string;
//   @Column()
//   owner: number;
//   @Column()
//   admins: number[];
//   @Column()
//   blockedUsers: number[];
//   @Column()
//   messages: Message[];
// }

// export class CreateChatDto {
//   rooms: ChatRoomDto[];
// }
