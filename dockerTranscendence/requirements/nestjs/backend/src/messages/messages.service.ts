import { Injectable } from '@nestjs/common';
import { Repository, In, getRepository, Not } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateRoomDto } from './dto/create-chatroom.dto';
import { Message } from './entities/message.entity';
import { ChatRoom } from './entities/chatRoom.entity';
// import { CronJob } from 'cron';
// import { Cron } from "../app.service";
import { UpdateUserDto } from "../users/dtos/UpdateUser.dto"
import { UsersService } from "../users/services/users/users.service";
//import { User } from 'typeorme';
import { User } from '../typeorme/user.entity';
import { UsersModule } from '../users/users.module';
import { stringify, parse } from 'flatted';
import { Console } from 'console';
import { join } from 'path';
import * as speakeasy from "speakeasy";
import { authenticator } from 'otplib';
// import bcrypt from "bcrypt";

@Injectable()
export class MessagesService {
  //any db but showing sarra y for test
  constructor(
    @InjectRepository(Message) private messageRepository: Repository<Message>,
    @InjectRepository(ChatRoom) private chatRoomRepository: Repository<ChatRoom>,
    private usersService: UsersService,
  ) { }


  // messages: Message[] = [{ id: 0, name: 'Focker', message: 'Hi', timestamp: `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}` }];
  clientToUser = {};
  clientToId = {};

  identify(name: string, clientId: string, userid: number) {
    this.clientToUser[clientId] = name;
    this.clientToId[clientId] = userid;
    return Object.values(this.clientToUser);
    //from db or just harcoded as it is
  }

  async getClientName(clientId: string) {
    return this.clientToUser[clientId];
  }

  async getClientId(clientId: string) {
    return this.clientToId[clientId];
  }

  async createRoom(roomName: string, owner: number, password: string, type: number): Promise<ChatRoom> {
    const welcomeMessage = new Message();
    const bcrypt = require('bcrypt');
    welcomeMessage.name = 'System'; // Set the name to "System" or any other desired value
    welcomeMessage.message = 'Welcome to the chat room!'; // Set the welcome message text
    welcomeMessage.timestamp = new Date().toUTCString(); // Set the timestamp
    const newRoom = new ChatRoom();
    newRoom.roomName = roomName;
    newRoom.roomType = type;
    if (password !== "") {
      await bcrypt.hash(password, 10).then(hash => {
        newRoom.password = hash;
      });
    }
    else
      newRoom.password = "";
    newRoom.owner = owner;
    newRoom.admins = [];
    newRoom.admins.push(owner);
    newRoom.blockedUsers = [];
    newRoom.users = [];
    if (type !== 2)
      newRoom.users.push(owner);
    newRoom.messages = [welcomeMessage]; // Initialize messages as an empty array of Message objects

    // Save the new chat room
    const savedRoom = await this.chatRoomRepository.save(newRoom);

    return savedRoom;
  }

  async create(createMessageDto: CreateMessageDto, clientId: string, chatRoomId: number, userid: number): Promise<Message> {
    const chatRoom = await this.chatRoomRepository.findOne({ where: { roomId: chatRoomId } });
    let user = await this.usersService.findUsersById(+userid);

    if (!chatRoom)
      return;
    const newMessage = this.messageRepository.create({
      name: user.names,
      userid: +userid,
      message: createMessageDto.message,
      timestamp: `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`,
      chatRoom: chatRoom, // Associate the message with the chat room
    });
    const savedMessage = await this.messageRepository.save(newMessage);
    return newMessage;
  }

  async findAll(chatRoomId: number): Promise<Message[]> {
    try {
      const chatRoom = await this.chatRoomRepository.findOne({
        where: { roomId: chatRoomId },
      });

      if (!chatRoom) {
        // Handle the case where the chat room doesn't exist.
        // You can return an empty array or take the appropriate action.
        return [];
      }

      const messages = await this.messageRepository.find({
        where: { chatRoom: { roomId: chatRoom.roomId } },
      });

      return messages;
    } catch (error) {
      // Handle any errors that occur during the process.
      return [];
    }
  }

  async findMessages(roomid: number, blocked: number[]): Promise<Message[]> {
    try {
      const chatRoom = await this.chatRoomRepository.findOne({ where: { roomId: roomid }, });
      if (!chatRoom)
        return [];
      let messages = await this.messageRepository.find({ where: { chatRoom: { roomId: chatRoom.roomId } } });
      let result = (await Promise.all(messages.map(async (n) => ({
        value: n,
        include: blocked.includes(n.userid) === false,
      })))).filter(v => v.include).map(data => data.value);
      return result;
    } catch (error) {
      // Handle any errors that occur during the process.
      return [];
    }
  }

  async checkChatRoomName(name: string): Promise<boolean> {
    const exists = await this.chatRoomRepository.findOne({ where: { roomName: name } });
    return !!exists;
  }

  async getAllChatrooms(): Promise<ChatRoom[]> {
    return this.chatRoomRepository.find({ relations: ['messages'] });
  }

  async getChatRoomByID(id: number): Promise<ChatRoom> {
    const room = await this.chatRoomRepository.findOne({ where: { roomId: id } });
    if (room === null)
      return ;
    return room;
  }

  async muteUser(id: number, time: number, userid: number) {
    let room = await this.getChatRoomByID(id);
    if (room === null)
      return ;
    let date = new Date();
    if (time === 1) {
      date.setMinutes(date.getMinutes() + 1);
    }
    else if (time === 2) {
      date.setDate(date.getDate() + 1);
    }
    else {
      date.setFullYear(date.getFullYear() + 20000);
    }
    room.mutedUsers.push({ id: +userid, date: date.getTime() });
    const savedRoom = await this.chatRoomRepository.save(room);
    return (room);
  }

  async unmuteUser(id: number, userid: number) {
    let room = await this.getChatRoomByID(id);
    if (room === null)
      return ;
    room.mutedUsers = room.mutedUsers.filter((number) => number.id !== +userid);
    const savedRoom = await this.chatRoomRepository.save(room);
    return (room);
  }

  async mutedUser(id: number, userid: number) {
    let muted = false;
    let room = await this.getChatRoomByID(id);
    if (room === null)
      return (false);
    let user;
    for (user in room.mutedUsers) {
      if (+room.mutedUsers[user].id === +userid) {
        let date = new Date();
        if (room.mutedUsers[user].date <= date.getTime()) {
          room.mutedUsers = room.mutedUsers.filter((number) => +number.id !== +userid);
          const savedRoom = await this.chatRoomRepository.save(room);
        }
        else {
          muted = true;
        }
      }
    }
    return (muted);
  }

  async banUser(id: number, userid: number) {
    let room = await this.getChatRoomByID(id);
    if (room === null)
      return ({r: null, t: false});
    room.bannedUsers.push(+userid);
    await this.chatRoomRepository.save(room);
    return ({r: room, t: true});
  }

  async unbanUser(id: number, userid: number) {
    let room = await this.getChatRoomByID(id);
    if (room === null)
      return ({r: null, t: false});
    room.bannedUsers = room.bannedUsers.filter((number) => number !== +userid);
    await this.chatRoomRepository.save(room);
    return ({r: room, t: false});
  }

  async bannedUser(id: number, userid: number) {
    let room = await this.getChatRoomByID(id);
    if (room === null)
      return (false);
    if (room.bannedUsers.includes(+userid) === true)
      return (true);
    return (false);
  }

  async kickUser(id: number, userid: number) {
    let room = await this.getChatRoomByID(id);
    if (room === null)
      return ({r: null, t: false});
    room.users = room.users.filter((num) => num !== +userid);
    await this.chatRoomRepository.save(room);

    let user = await this.usersService.findUsersById(+userid);
    if (user === null)
      return ({r: null, t: false});
    user.chatRooms = user.chatRooms.filter((num) => num !== id)
    await this.usersService.patchUser(userid, user);

    return ({r: room, t: false});
  }

  async giveAdminUser(id: number, userid: number) {
    let room = await this.getChatRoomByID(id);
    if (room === null)
      return ({r: null, t: false});
    room.admins.push(+userid);
    await this.chatRoomRepository.save(room);
    return ({r: room, t: true});
  }

  async takeAdminUser(id: number, userid: number) {
    let room = await this.getChatRoomByID(id);
    if (room === null)
      return ({r: null, t: false});
    room.admins = room.admins.filter((number) => number !== +userid);
    await this.chatRoomRepository.save(room);
    return ({r: room, t: true});
  }

  async adminUser(id: number, userid: number) {
    let room = await this.getChatRoomByID(id);
    if (room === null)
      return (false);
    if (room.admins.includes(+userid) === true)
      return (true);
    return (false);
  }

  async ownerUser(id: number, userid: number) {
    let room = await this.getChatRoomByID(id);
    if (room === null)
      return (false);
    if (room.owner === +userid)
      return (true);
    return (false);
  }

  async joinChat(id: number, userid: number) {
    let room = await this.getChatRoomByID(id);

    if (room === null)
      return (false);

    room.users.push(+userid);
    await this.chatRoomRepository.save(room);
    let user = await this.usersService.findUsersById(+userid);

    if (user === null)
      return (false);

    user.chatRooms.push(id);
    await this.usersService.patchUser(userid, user);
    return (true);
  }

  async updateChat(id: number, pass: string, type: number) {
    let room = await this.getChatRoomByID(id);

    if (room === null)
      return (false);

    const bcrypt = require('bcrypt');
    room.roomType = type;
    if (pass !== "") {
      await bcrypt.hash(pass, 10).then(hash => {
        room.password = hash;
      });
    }
    else
      room.password = "";
    await this.chatRoomRepository.save(room);
    return (true);
  }

  async assignPrivate(uid1: number, uid2: number, roomid: number) {
    let user1 = await this.usersService.findUsersById(+uid1);
    let user2 = await this.usersService.findUsersById(+uid2);

    if (user1 === null || user2 === null)
      return ;

    let obj1 = {
      userid: +uid2,
      chatid: +roomid,
      name: user2.names,
    }

    let obj2 = {
      userid: +uid1,
      chatid: +roomid,
      name: user1.names,
    }

    if (user1.privateRooms.length === undefined)
      user1.privateRooms = [];
    if (user2.privateRooms.length === undefined)
      user2.privateRooms = [];

    user1.privateRooms.push(obj1);
    user2.privateRooms.push(obj2);


    await this.usersService.patchUser(uid1, user1);
    await this.usersService.patchUser(uid2, user2);

    await this.joinChat(roomid, uid1);
    await this.joinChat(roomid, uid2);
    return "";
  }

  async getPrivate(userid: number) {
    let user = await this.usersService.findUsersById(+userid);
    return (user.privateRooms);
  }

  async addFriend(uid1: number, uid2: number) {
    let user1 = await this.usersService.findUsersById(+uid1);
    let user2 = await this.usersService.findUsersById(+uid2);

    if (user1 === null || user2 === null)
      return ;

    user1.friendsId.push(uid2);
    user2.friendsId.push(uid1);

    await this.usersService.patchUser(+uid1, user1);
    await this.usersService.patchUser(+uid2, user2);
  }

  async deleteFriend(uid1: number, uid2: number) {
    let user1 = await this.usersService.findUsersById(+uid1);
    let user2 = await this.usersService.findUsersById(+uid2);

    if (user1 === null || user2 === null)
      return ;
    user1.friendsId = user1.friendsId.filter((num) => num !== +uid2);
    user2.friendsId = user2.friendsId.filter((num) => num !== +uid1);

    await this.usersService.patchUser(+uid1, user1);
    await this.usersService.patchUser(+uid2, user2);
  }

  async logout(uid: number) {
    let user = await this.usersService.findUsersById(+uid);
    let date = new Date();
    if (user !== null)
    {
      if (user.logged !== null)
      {
        if (+user.logged.n > 3 && (date.getTime() - +user.logged.n) > 30000)
          user.logged.n = 0;
        else if (+user.logged.n != 0)
          user.logged.n = 1;

        await this.usersService.patchUser(+uid, user);
        if (user.logged.n === 0)
          return true;
      }
    }
    return false;
  }

  async login(uid: number) {
    let user = await this.usersService.findUsersById(+uid);

    if (user !== null)
    {
      user.logged = { n: 1 };

      await this.usersService.patchUser(+uid, user);
    }
  }

  async idle(uid: number) {
    let user = await this.usersService.findUsersById(+uid);
    let date = new Date();

    if (user !== null)
    {
      if ( user.isPlaying.state === false)
      {
        if (user.logged !== null)
          user.logged.n = date.getTime();
        else
          user.logged = {n: date.getTime()};
        await this.usersService.patchUser(+uid, user);
        return true;
      }
    }
    return false;
  }

  async changeName(uid: number, name: string) {
    let user = await this.usersService.findUsersById(+uid);
    if (user === null)
      return ;
    user.names = name;
    await this.usersService.patchUser(uid, user);
  }

  async updateRank(uid: number, rank: string) {
    let user = await this.usersService.findUsersById(+uid);
    if (user === null)
      return ;
    user.rank = rank;
    await this.usersService.patchUser(uid, user);
  }

  async passCheck(pass: string, roomid: number) {
    const bcrypt = require('bcrypt');
    let room = await this.getChatRoomByID(roomid);
    if (room === null)
      return false;
    const match = await bcrypt.compare(pass, room.password).then(result => {
      return (result);
    });
    return (match);
  }

  async authGen(userid: number)
	{
		const optSecret = authenticator.generateSecret();
		const secretBase32 = speakeasy.totp({
			secret: optSecret,
			encoding: "base32",
		});
		const otp = authenticator.generate(optSecret);
		let user = await this.usersService.findUsersById(userid);
    if (user === null)
      return ;
		user.auth = optSecret;
		this.usersService.patchUser(userid, user);
		return optSecret;
	}

  async authChecker(userid: number, code: string)
	{
		let user = await this.usersService.findUsersById(userid);
    if (user === null)
      return ;
    const otp = authenticator.generate(user.auth);
    if (otp === code)
      return true;
    return false;
	}

}