import { Controller, Get, Param, ParseIntPipe, } from '@nestjs/common';
import { AppService, User } from './app.service';
import { MessagesService } from './messages/messages.service';
import { GameService } from './game/game.service';
// import { UsersService } from './users/services/users/users.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly messagesService: MessagesService, // Inject the MessagesService
    private readonly gameService: GameService
  ) { }

  @Get('/secret/:userid')
  getSecret(@Param('userid', ParseIntPipe) userid: number) {
    return this.appService.secretGen(userid);
  };

  @Get('/chatrooms')
  async getChatrooms() {
    const chatrooms = await this.messagesService.getAllChatrooms(); // Implement a method in MessagesService to fetch chatrooms
    return chatrooms;
  };

  @Get('games')
  async getGames() {
    const games = await this.gameService.getAllGames();
    return games;
  };


}
