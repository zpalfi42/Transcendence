import { IsOptional, MinLength, IsNotEmpty, IsArray } from 'class-validator';
import { Cron } from "../../app.service";

export class UpdateUserDto {
	@IsOptional() // This field is optional for updates
	@MinLength(3) // You can define different validation rules for updates
	names: string;

	@IsOptional()
	type: string;

	@IsOptional()
	@IsArray()
	friends: string[];

	@IsOptional()
	@IsArray()
	friendsId: number[];

	@IsOptional()
	@IsArray()
	blocked: number[];

	@IsOptional()
	@IsArray()
	chatRooms: number[];

	@IsOptional()
	privateRooms: Array<{userid: number, chatid: number, name: string}>;

	@IsOptional()
	@IsArray()
	achievements: string[];

	@IsOptional()
	logged: {n: number};

	@IsOptional()
	picture: string;

	@IsOptional()
	sayHi: string;

	@IsOptional()
	results: { won: number; lost: number; total: number; points: number };

	@IsOptional()
	lastMatches: {
		game: number;
		against: string;
		result: string;
		icon: string;
	}[];

	@IsOptional()
	userPic: string;

	@IsOptional()
	rank: string;

	@IsOptional()
	twoFactor: boolean;

	@IsOptional()
	auth: string;
}
