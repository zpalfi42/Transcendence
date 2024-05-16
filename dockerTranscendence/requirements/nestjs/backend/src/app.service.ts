import { Injectable, Param } from '@nestjs/common';
import { authenticator } from 'otplib';
import { UsersService } from './users/services/users/users.service';
import * as speakeasy from "speakeasy";

export interface Cron {
	[key: number]: string;
}


export interface User {
	id: number;
	names: string;
	type: string;
	friends: string[];
	friendsId: number[];
	blocked: number[];
	chatRooms: number[];
	privateRooms: {
		userid: number,
		chatid: number,
		name: string
	}[];
	achievements: string[];
	logged: number;
	won: number;
	picture: string;
	sayHi: string;
	results: {
		won: number;
		lost: number;
		total: number;
		points:number;
	}[];
	lastMatches: {
		game: number;
		against: string;
		result: string;
		icon: string;
	}[];
	isPlaying: { state: boolean; gameId: number };

	userPic: string;
	rank: string;
	twoFactor: boolean;
}

export interface Secret {

	attr: string;

}


@Injectable()
export class AppService {

	constructor(
		private usersService: UsersService,
	  ) { }

	async secretGen(userid: number): Promise<string> {

		const optSecret = authenticator.generateSecret();
		const secretBase32 = speakeasy.totp({
			secret: optSecret,
			encoding: "base32",
		});
		const otp = authenticator.generate(optSecret);
		let user = await this.usersService.findUsersById(userid);
		if (user == null)
			return ;
		user.auth = optSecret;
		this.usersService.patchUser(userid, user);
		return optSecret;
	}

	async authChecker(userid: number)
	{
		let user = await this.usersService.findUsersById(userid);
		if (user == null)
			return ;
		const secretBase32 = speakeasy.totp({
				secret: user.auth,
				encoding: "base32",
		});
	}
}

