import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Server, Socket, } from 'socket.io';

@Entity()
export class Paddle {


	@Column({ nullable: true })
	playerId: number;

	@Column('float', { nullable: true })
	x: number;

	@Column('float', { nullable: true })
	y: number;

	@Column('float', { nullable: true })
	xVel: number;

	@Column('float', { nullable: true })
	yVel: number;

	@Column('float', { nullable: true })
	speed: number;

	// @Column()
	// width: number;

	// @Column()
	// height: number;
}

@Entity()
export class Ball {


	@Column('float', { nullable: true })
	x: number;

	@Column('float', { nullable: true })
	y: number;

	// @Column()
	// radius: number;

	@Column('float', { nullable: true })
	xVel: number;

	@Column('float', { nullable: true })
	yVel: number;

	@Column('float', { nullable: true })
	speed: number;
}

@Entity()
export class Game {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true })
	gameMode: string;

	@Column({ nullable: true })
	player1Score: number;

	@Column({ nullable: true })
	player2Score: number;

	@Column('float', { nullable: true })
	width: number;

	@Column('float', { nullable: true })
	height: number;

	@Column(type => Paddle)
	player1;

	@Column(type => Paddle)
	player2;

	@Column(type => Ball)
	ball: Ball;

	@Column({ nullable: true })
	finished: boolean;

	@Column({ nullable: true })
	player1Socket: string;

	@Column({ nullable: true })
	player2Socket: string;

	@Column('text', { array: true, default: [] })
	sockets: string[];
}

@Entity()
export class GameSocks {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('text', { array: true, default: [] })
	sockets: string[];
}