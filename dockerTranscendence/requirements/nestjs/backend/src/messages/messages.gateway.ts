// eslint-disable-next-line prettier/prettier
import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateRoomDto } from './dto/create-chatroom.dto';
import { Server, Socket, } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagesGateway {
  @WebSocketServer()
  server: Server;

  // eslint-disable-next-line prettier/prettier
  constructor(private readonly messagesService: MessagesService) { }


  @SubscribeMessage('createMessage')
  async create(
    @MessageBody() messageData: { message: string, roomId: number, userid: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { message, roomId, userid } = messageData;
    const createMessageDto = new CreateMessageDto();
    createMessageDto.message = message;
    const createdMessage = await this.messagesService.create(createMessageDto, client.id, roomId, userid);

    this.server.emit('message', createdMessage);
    return createdMessage;
  }

  @SubscribeMessage('createRoom')
  async createRoom(
    @MessageBody() roomData: { roomName: string, owner: number, password: string, type: number },
    @ConnectedSocket() client: Socket,
  ) {
    console.log("CREATING ROOOM");  
    const { roomName, owner, password, type } = roomData;
    // const createRoomDto = new CreateRoomDto();
    // createRoomDto.roomName = roomName; // Use the roomName from the DTO
    // createRoomDto.owner = owner; // Use the client's id as the owner
    const chatRoom = await this.messagesService.createRoom(roomName, owner, password, type);

    this.server.emit('chatRoom', chatRoom);
    return chatRoom;
  }

  @SubscribeMessage('findAllMessages')
  async findAll(@MessageBody() chatRoomId: number, @ConnectedSocket() client: Socket) {
    const messages = await this.messagesService.findAll(chatRoomId);
    // Emit the messages to the client or handle them as needed

    return messages;
  }

  @SubscribeMessage('findMessages')
  async findMessages(
    @MessageBody() data: { roomid: number, blocked: number[] },
    @ConnectedSocket() client: Socket) {
    const messages = await this.messagesService.findMessages(data.roomid, data.blocked);
    // Emit the messages to the client or handle them as needed

    return messages;
  }

  @SubscribeMessage('join')
  joinRoom(
    @MessageBody() data: { name: string; roomId: string, userid: number },
    @ConnectedSocket() client: Socket,
  ) {

    return this.messagesService.identify(data.name, client.id, data.userid);
  }

  @SubscribeMessage('typing')
  async typing(
    @MessageBody() data: { isTyping: boolean, roomid: number },
    @ConnectedSocket() client: Socket,
  ) {
    let isTyping = data.isTyping;
    let roomid = data.roomid;
    let id = await this.messagesService.getClientId(client.id);
    const name = await this.messagesService.getClientName(client.id);
    client.broadcast.emit('typing', { name, isTyping, id, roomid });

  }


  @SubscribeMessage('findAllChatRooms')
  async handleFindAllChatRooms(client: Socket) {

    const chatRooms = await this.messagesService.getAllChatrooms();
    return chatRooms;
  }

  @SubscribeMessage('checkChatRoomName')
  async checkChatRoomName(
    @MessageBody() value: string,
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.checkChatRoomName(value);
    return message;
  }

  @SubscribeMessage('getChatRoomByID')
  async getChatRoomByID(
    @MessageBody() id: number,
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.getChatRoomByID(id);
    return message;
  }

  @SubscribeMessage('muteUser')
  async muteUser(
    @MessageBody() data: { id: number, time: number, userid: number },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.muteUser(data.id, data.time, data.userid);
    return message;
  }

  @SubscribeMessage('unmuteUser')
  async unmuteUser(
    @MessageBody() data: { id: number, userid: number },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.unmuteUser(data.id, data.userid);
    return message;
  }

  @SubscribeMessage('mutedUser')
  async mutedUser(
    @MessageBody() data: { id: number, userid: number },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.mutedUser(data.id, data.userid);
    return message;
  }

  @SubscribeMessage('ban')
  async banUser(
    @MessageBody() data: { id: number, userid: number },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.banUser(data.id, data.userid);
    if (message.r !== null)
      this.server.emit('chatChanged', data.userid, message.r.roomId);
    return message.t;
  }

  @SubscribeMessage('unban')
  async unbanUser(
    @MessageBody() data: { id: number, userid: number },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.unbanUser(data.id, data.userid);
    if (message.r !== null)
      this.server.emit('chatChanged', data.userid, message.r.roomId);
    return message.t;
  }

  @SubscribeMessage('bannedUser')
  async bannedUser(
    @MessageBody() data: { id: number, userid: number },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.bannedUser(data.id, data.userid);
    return message;
  }

  @SubscribeMessage('kick')
  async kickUser(
    @MessageBody() data: { id: number, userid: number },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.kickUser(data.id, data.userid);
    if (message.r !== null)
      this.server.emit('chatChanged', data.userid, message.r.roomId);
    this.server.emit('user', "kick");
    return message.t;
  }

  @SubscribeMessage('giveAdmin')
  async giveAdminUser(
    @MessageBody() data: { id: number, userid: number },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.giveAdminUser(data.id, data.userid);
    if (message.r !== null)
      this.server.emit('chatChanged', data.userid, message.r.roomId);
    return message.t;
  }

  @SubscribeMessage('takeAdmin')
  async takeAdminUser(
    @MessageBody() data: { id: number, userid: number },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.takeAdminUser(data.id, data.userid);
    if (message.r !== null)
      this.server.emit('chatChanged', data.userid, message.r.roomId);
    return message.t;
  }

  @SubscribeMessage('adminUser')
  async adminUser(
    @MessageBody() data: { id: number, userid: number },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.adminUser(data.id, data.userid);
    return message;
  }

  @SubscribeMessage('ownerUser')
  async ownerUser(
    @MessageBody() data: { id: number, userid: number },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.ownerUser(data.id, data.userid);
    return message;
  }

  @SubscribeMessage('joinChat')
  async joinChat(
    @MessageBody() data: { id: number, userid: number },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.joinChat(data.id, data.userid);
    return message;
  }

  @SubscribeMessage('updateChat')
  async updateChat(
    @MessageBody() data: { id: number, pass: string, type: number },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.updateChat(data.id, data.pass, data.type);
    return message;
  }

  @SubscribeMessage('assignPrivate')
  async assignPrivate(
    @MessageBody() data: { user1id: number, user2id: number, roomid: number },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.assignPrivate(data.user1id, data.user2id, data.roomid);
    this.server.emit('user', "AssignPriv");
    this.server.emit('chatChanged', data.user1id, data.roomid);
    this.server.emit('chatChanged', data.user2id, data.roomid);

    return message;
  }

  @SubscribeMessage('getPrivate')
  async getPrivate(
    @MessageBody() data: { userid: number },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.getPrivate(data.userid);
    return message;
  }

  @SubscribeMessage('userUpdated')
  async userUpdate(
    @MessageBody() data: {},
    @ConnectedSocket() client: Socket,
  ) {
    this.server.emit('user', "userUpdated");
  }

  @SubscribeMessage('addFriend')
  async addFriend(
    @MessageBody() data: { userid1: number, userid2: number },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.addFriend(data.userid1, data.userid2);
    this.server.emit('user', "addFriend");
    return message;
  }

  @SubscribeMessage('deleteFriend')
  async deleteFriend(
    @MessageBody() data: { userid1: number, userid2: number },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.deleteFriend(data.userid1, data.userid2);
    this.server.emit('user', "deleteFriend");
    return message;
  }

  @SubscribeMessage('logout')
  async logout(
    @MessageBody() data: { userid: number },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.logout(data.userid);
    this.server.emit('user', "Logout");
    return message;
  }

  @SubscribeMessage('idle')
  async idle(
    @MessageBody() data: { userid: number },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.idle(data.userid);
    if (message === true)
      this.server.emit('user', "Idle");
    return message;
  }

  @SubscribeMessage('login')
  async login(
    @MessageBody() data: { userid: number },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.login(data.userid);
    this.server.emit('user', "Login");
    return message;
  }

  @SubscribeMessage('picChanged')
  picChanged(

    @ConnectedSocket() client: Socket,
  ) {
    setTimeout(() => {
      this.server.emit('someUpdate');
    }, 400);
  }

  @SubscribeMessage('changeUserName')
  async changeName(
    @MessageBody() data: { userid: number, name: string },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.changeName(data.userid, data.name);
    this.server.emit('user', "ChangeUserName");
    return message;
  }

  @SubscribeMessage('changeRank')
  async changeRank(
    @MessageBody() data: { userid: number, rank: string },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.updateRank(data.userid, data.rank);
    // this.server.emit('user', "ChangeRank");
    return message;
  }

  @SubscribeMessage('passCheck')
  async passCheck(
    @MessageBody() data: { pass: string, roomid: number },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.passCheck(data.pass, data.roomid);
    return message;
  }

  @SubscribeMessage('authGen')
  async authGen(
    @MessageBody() data: { userid: number },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.authGen(data.userid);
    return message;
  }

  @SubscribeMessage('authChecker')
  async authChecker(
    @MessageBody() data: { userid: number, code: string },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.authChecker(data.userid, data.code);
    return message;
  }
}
