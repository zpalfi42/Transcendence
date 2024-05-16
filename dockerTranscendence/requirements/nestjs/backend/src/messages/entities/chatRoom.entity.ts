import { Entity, Column, PrimaryGeneratedColumn, OneToMany, NumericType } from 'typeorm';
import { Message } from './message.entity';

@Entity()
export class ChatRoom {
	@PrimaryGeneratedColumn()
	roomId: number;
	@Column()
	roomType: number; // 0: normal chatroom | 1: password chatroom | 2: private message chatroom
	@Column()
	roomName: string;
	@Column()
	owner: number;
	@Column()
	password: string;
	@Column('int', { array: true, default: [] }) // Treat "admins" as an array of integers
	admins: number[];
	@Column('int', { array: true, default: [] }) // Treat "blockedUsers" as an array of integers
	blockedUsers: number[];
	@Column({ type: 'jsonb', array: false, default: () => "'[]'", nullable: false })
	mutedUsers: Array<{id: number, date: number}>;
	@Column('int', { array: true, default: [] }) // Treat "blockedUsers" as an array of integers
	bannedUsers: number[];
	@Column('int', { array: true, default: [] })
	users: number[]
	@OneToMany(() => Message, (message) => message.chatRoom)
	messages: Message[];
}
