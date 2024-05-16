import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Server, Socket, } from 'socket.io';
import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Paddle, Ball, Game } from './entities/game.entity';
import { UsersService } from '../users/services/users/users.service';
import { CreateUserDto } from '../users/dtos/CreateUser.dto';
enum KeyBindings {
  //p1
  UP = 87,
  DOWN = 83,
  //p2
  UP2 = 79,
  DOWN2 = 76,
  //specials
  POWER = 80,
  STICKY = 32,

}
const updateInterval = 20.8;


@WebSocketGateway({
  cors: {
    origin: '*',
  },
})


export class GameGateway {
  @WebSocketServer()
  server: Server;

  // private readonly usersService: UsersService;
  private gameLoopInterval: NodeJS.Timeout;
  private games: Map<number, { game: any; sockets: Socket[] }> = new Map();
  private gameLoopIntervals: Map<number, NodeJS.Timeout> = new Map();
  private sockets: Map<String, Socket> = new Map();


  private async startGameLoop(gameId: number, userid: number) {
    const interval = await setInterval(async () => {
      let gameData = await this.gameService.findOne(gameId);
      if (!gameData.finished) {
        await this.handleGameLogic(gameId, userid);
        gameData = await this.gameService.findOne(gameId);
        await this.updateGameAndEmit(gameId, gameData);
      }
    }, updateInterval);

    this.gameLoopIntervals.set(gameId, interval);
  }

  constructor(private readonly gameService: GameService, private readonly usersService: UsersService) { }

  @SubscribeMessage('createGame')
  async createGame(

    @MessageBody() gameData: { gameMode: string, ball: Ball, width: number, height: number, gameid: number, p1: Paddle, p2: Paddle, userid: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { gameMode, ball } = gameData;

    let actualGame;
    let user = await this.usersService.findUsersById(+gameData.userid);
    if (user.isPlaying.state === true) {
      actualGame = await this.findOne(user.isPlaying.gameId);
      return actualGame;
    }
    actualGame = await this.findOne(gameData.gameid);
    let user2 = await this.usersService.findUsersById(+actualGame.player2.playerId);
    user.isPlaying.state = true;
    user2.isPlaying.state = true;
    actualGame.ball = gameData.ball;
    actualGame.gameMode = gameData.gameMode;
    actualGame.player1Score = 0;
    actualGame.player2Score = 0;
    actualGame.player1.xVel = gameData.p1.xVel;
    actualGame.player1.yVel = gameData.p1.yVel;
    actualGame.player1.x = gameData.p1.x;
    actualGame.player1.y = gameData.p1.y;
    actualGame.player2.xVel = gameData.p2.xVel;
    actualGame.player2.yVel = gameData.p2.yVel;
    actualGame.player2.x = gameData.p2.x;
    actualGame.player2.y = gameData.p2.y;
    actualGame.width = gameData.width;
    actualGame.height = gameData.height;
    actualGame.finished = false;
    await this.usersService.patchUser(gameData.userid, user);
    await this.usersService.patchUser(+actualGame.player2.playerId, user2);
    const updatedGame = await this.gameService.update(actualGame.id, actualGame)
    this.server.emit('gameRoom', updatedGame);
    this.startGameLoop(updatedGame.id, gameData.userid);

    return updatedGame;
  }

  @SubscribeMessage('findAllGames')
  async findAll(client: Socket) {
    const allGames = await this.gameService.getAllGames();
    return allGames;
  }

  @SubscribeMessage('findOneGame')
  findOne(@MessageBody() id: number) {
    return this.gameService.findOne(id);
  }


  private async updateGameAndEmit(gameId: number, game: any) {
    let gamee = await this.gameService.findOne(gameId);
    if (gamee && gamee.finished === false)
    {
      let socks = await this.gameService.findSocks(gameId);
      socks.sockets.forEach((socket) => {
        if (this.sockets[socket] !== undefined)
          this.sockets[socket].emit('gameChanged', gamee);
      });
    }
  }

  private updateAchievements(user: CreateUserDto, winner: boolean) {
    let achievements: string[] = [];
    let won = user.results.won;
    let lost = user.results.lost;
    let total = user.results.total;

    if (winner) { //just for winner checks
      switch (won) {
        case 1:
          if (total == 1)
            achievements.push("goldBall");
          achievements.push("bluePaddle");
          break;
        case 3:
          if (total = 3)
            achievements.push("greenTrohpy");
          break;
        case 10:
          if (total == 10)
            achievements.push("goldTrohpy");
          break;


      }
    }
    else { //just for loser checks
      switch (lost) {
        case 1:
          if (total == 1)
            achievements.push("asaddie2");
          break;
        case 3:
          if (total = 3)
            achievements.push("whitePaddle");
          break;
        case 10:
          if (total == 10)
            achievements.push("aFire");
          break;
      }
      // console.log("loser");
    }
    //common checks
    if (total == 10) {
      if (won == lost)
        achievements.push("theWarrior");
      achievements.push("ready");
    }
    if (user.results.points == 42)
      achievements.push("anAlien");
    if (user.lastMatches.length === 5) {
      const lovedUser = user.lastMatches[0].against;
      if (user.lastMatches.every((match) => match.against === lovedUser)) {
        achievements.push("oneLove");
      }
    }
    if (user.rank == "1")
      achievements.push("theStar");
    return achievements;
  }

  private async updateResults(actualGame: Game) {
    let user1 = await this.usersService.findUsersById(actualGame.player1.playerId);
    let user2 = await this.usersService.findUsersById(actualGame.player2.playerId);

    actualGame.player1Score
    // console.log("game finished Before  ", actualGame.player1Score);
    const isPlayer1Winner = actualGame.player1Score > actualGame.player2Score;
    const isPlayer2Winner = !isPlayer1Winner;


    if (user1.results === undefined || user1.results === null)
      user1.results = {"won":0,"lost":0,"total":0,"points":0};

    if (user2.results === undefined || user2.results === null)
      user2.results = {"won":0,"lost":0,"total":0,"points":0};

    if (actualGame.player1Score > actualGame.player2Score)
    {
      user1.results.won = user1.results.won +1;
      user2.results.lost = user2.results.lost + 1;
      user1.results.total = user1.results.total + 1;
      user2.results.total = user2.results.total + 1;
    }
    else
    {
      user2.results.won = user2.results.won +1;
      user1.results.lost = user1.results.lost + 1;
      user2.results.total = user2.results.total + 1;
      user1.results.total = user1.results.total + 1;
    }

    user1.results.points = user1.results.points + (actualGame.player1Score - actualGame.player2Score);
    user2.results.points = user2.results.points + (actualGame.player2Score - actualGame.player1Score);

    // user1.results = user1.results && user1.results
    //   ? (actualGame.player1Score > actualGame.player2Score
    //     ? [{ won: (user1.results?.won || 0) + 1, lost: user1.results?.lost || 0, total: (user1.results?.total || 0) + 1, points: (user1.results?.points || 0) + (actualGame.player1Score - actualGame.player2Score) }]
    //     : [{ won: user1.results?.won || 0, lost: (user1.results?.lost || 0) + 1, total: (user1.results?.total || 0) + 1, points: (user1.results?.points || 0) + (actualGame.player1Score - actualGame.player2Score) }])
    //   : [{ won: actualGame.player1Score > actualGame.player2Score ? 1 : 0, lost: actualGame.player1Score > actualGame.player2Score ? 0 : 1, total: 1, points: (user1.results?.points || 0) + (actualGame.player1Score - actualGame.player2Score) }];

    // user2.results = user2.results && user2.results
    //   ? (actualGame.player2Score > actualGame.player1Score
    //     ? [{ won: (user2.results?.won || 0) + 1, lost: user2.results?.lost || 0, total: (user2.results?.total || 0) + 1, points: (user2.results?.points || 0) + (actualGame.player2Score - actualGame.player1Score) }]
    //     : [{ won: user2.results?.won || 0, lost: (user2.results?.lost || 0) + 1, total: (user2.results?.total || 0) + 1, points: (user2.results?.points || 0) + (actualGame.player2Score - actualGame.player1Score) }])
    //   : [{ won: actualGame.player2Score > actualGame.player1Score ? 1 : 0, lost: actualGame.player2Score > actualGame.player1Score ? 0 : 1, total: 1, points: (user2.results?.points || 0) + (actualGame.player2Score - actualGame.player1Score) }];


    const newAchievementsU1 = this.updateAchievements(user1, isPlayer1Winner);
    const newAchievementsU2 = this.updateAchievements(user2, isPlayer2Winner);
    user1.achievements = [...new Set([...user1.achievements, ...newAchievementsU1])];
    user2.achievements = [...new Set([...user2.achievements, ...newAchievementsU2])];
    // lastmaches

    user1.lastMatches = user1.lastMatches || [];
    const resultString1 = actualGame.player1Score.toString() + "-" + actualGame.player2Score.toString();
    const resultString2 = actualGame.player2Score.toString() + "-" + actualGame.player1Score.toString();

    user1.lastMatches.push({
      game: user1.results.total,
      against: user2.names,
      result: resultString1,
      icon: actualGame.player1Score > actualGame.player2Score ? "../assets/win.png" : "../assets/lose.png",
    });

    user2.lastMatches.push({
      game: user2.results.total,
      against: user1.names,
      result: resultString2,
      icon: actualGame.player1Score > actualGame.player2Score ? "../assets/lose.png" : "../assets/win.png",
    });

    user1.isPlaying.gameId = 0;
    user2.isPlaying.gameId = 0;
    user1.isPlaying.state = false;
    user2.isPlaying.state = false;
    user1.logged.n = 1;
    user2.logged.n = 1;
    await this.usersService.patchUser(user1.id, user1);
    await this.usersService.patchUser(user2.id, user2);
    // console.log("game finished  AFTER", user1.results);
    this.server.emit('user');
  }

  private async handleGameLogic(updatedGameId: number, userid: number) {
    const actualGame = await this.gameService.findOne(updatedGameId);
    const ball = actualGame.ball;

    if ((actualGame.player1Score >= 5 || actualGame.player2Score >= 5) && actualGame.finished !== true)
    {
      actualGame.finished = true;
      this.update(actualGame);
      let socks = await this.gameService.findSocks(actualGame.id);
      socks.sockets.forEach((socket) => {
        if (this.sockets[socket] !== undefined)
          this.sockets[socket].emit('gameChanged', actualGame);
      });
      // actualGame.sockets.forEach((socket) => {
      //   if (this.sockets[socket] !== undefined)
      //     this.sockets[socket].emit('gameChanged', actualGame);
      // });
      if (this.gameLoopInterval)
      {
        clearInterval(this.gameLoopInterval);
        this.gameLoopIntervals.delete(updatedGameId);
      }
      await this.updateResults(actualGame);
    }
    else if (actualGame.finished !== true)
    {
      if (actualGame.ball.speed !== undefined)
        actualGame.ball.speed = 5;

      if (ball.y <= 15)
        ball.yVel *= -1;

      if (ball.y >= actualGame.height - 20)
        ball.yVel *= -1;

      if (ball.x <= 0)
      {
        actualGame.player2Score += 1;
        ball.x = actualGame.width / 2;
      }

      if (ball.x >= actualGame.width)
      {
        actualGame.player1Score += 1;
        ball.x = actualGame.width / 2;
      }

      if (ball.x + (actualGame.height / 100) <= actualGame.player1.x + (actualGame.width / 70))
      {
        if (ball.y >= actualGame.player1.y && ball.y <= actualGame.player1.y + actualGame.height / 6.7)
        {
          ball.xVel = (ball.y > (actualGame.player1.y + actualGame.height / 6.7 / 4) && ball.y < (actualGame.player1.y + actualGame.height / 6.7 / 4 * 3) ? 2.5 : 1);
          ball.yVel = (ball.y - (actualGame.player1.y + actualGame.height / 6.7 / 2)) / 20;
          ball.speed *= 1.03 + (actualGame.player1.yVel * .03);
        }
      }

      if (ball.x + (actualGame.height / 100) >= actualGame.player2.x - (actualGame.width / 100))
      {
        if (ball.y >= actualGame.player2.y && ball.y <= actualGame.player2.y + actualGame.height / 6.7)
        {
          ball.xVel = (ball.y > (actualGame.player2.y + actualGame.height / 6.7 / 4) && ball.y < (actualGame.player2.y + actualGame.height / 6.7 / 4 * 3) ? -2.5 : -1);
          ball.yVel = -(ball.y - (actualGame.player2.y + actualGame.height / 6.7 / 2)) / 20;
          ball.speed *= 1.03 + (actualGame.player2.yVel * .03);
        }
      }
      ball.x += ball.xVel * (ball.speed * 1);
      ball.y += ball.yVel * (ball.speed * 1);
      actualGame.ball = ball;
      this.update(actualGame);
    }
  }

  async update(@MessageBody() updateGameDto: UpdateGameDto) {
    const updatedGame = await this.gameService.update(updateGameDto.id, updateGameDto);
    this.updateGameAndEmit(updateGameDto.id, updatedGame);
  }

  @SubscribeMessage('removeGame')
  remove(@MessageBody() id: number) {
    return this.gameService.remove(id);
  }

  @SubscribeMessage('playerInput')
  async handlePlayerInput(@MessageBody() input: any): Promise<any> {
    // console.log("PLAYER");
    const { actualGame, gameId, playerId, keyCode, canvasWidth, canvasHeight, playerHeight } = input;
    const playerToUpdate = actualGame.player1.playerId === playerId
      ? actualGame.player1
      : actualGame.player2;

    actualGame.height = 600;
    actualGame.width = 1050;

    switch (keyCode) {
      case KeyBindings.UP:
        playerToUpdate.yVel = -1;

        if (playerToUpdate.y <= actualGame.height / 30)
          playerToUpdate.yVel = 0;
        break;

      case KeyBindings.DOWN:
        playerToUpdate.yVel = 1;

        if (playerToUpdate.y + actualGame.height / 6.7 >= actualGame.height - (actualGame.height / 30))
          playerToUpdate.yVel = 0;
        break;

      case KeyBindings.STICKY:
        if (actualGame.ball.xVel === 0) {
          actualGame.ball.x = actualGame.height / 2;
          actualGame.ball.y = actualGame.width / 2;
        }
        break;

      case KeyBindings.POWER: // trying stoopid thing for game
        playerToUpdate.yVel = 0;
        playerToUpdate.y = actualGame.height / 70;
        playerToUpdate.height = actualGame.width / 1.05;
        break;



      case KeyBindings.UP2:

        playerToUpdate.yVel = -1;
        if (playerToUpdate.y <= actualGame.height / 30) {
          playerToUpdate.yVel = 0;
        }
        break;

      case KeyBindings.DOWN2:

        playerToUpdate.yVel = 1;
        if (playerToUpdate.y + actualGame.height / 6.7 >= actualGame.height - actualGame.height / 30) {
          playerToUpdate.yVel = 0;
        }
        break;

      default:
        console.warn(`Unhandled keyCode: ${keyCode}`);
        break;
    }

    playerToUpdate.y = playerToUpdate.y + playerToUpdate.yVel * 15 > actualGame.height - actualGame.height / 30 ? actualGame.height - actualGame.height / 30 - (playerToUpdate.height * 1.85) : playerToUpdate.y + playerToUpdate.yVel * 15;
    if (!playerToUpdate.y)
      playerToUpdate.y = canvasHeight / 2;

    const updatedGame = await this.gameService.update(actualGame.id, actualGame);
    this.updateGameAndEmit(actualGame.id, updatedGame);
  } catch(error) {
    console.error('Error handling player input:', error);
  }

  @SubscribeMessage('gameQueue')
  async gameQueue(
    @MessageBody() userid: number,
    @ConnectedSocket() client: Socket
  ) {
    await this.gameService.gameQueue(userid, client);
    this.sockets[client.id] = client;
    this.server.emit('user');
  }

  @SubscribeMessage('deleteQueue')
  async deleteQueue(
    @MessageBody() userid: number,
    @ConnectedSocket() client: Socket
  ) {
    await this.gameService.deleteQueue(userid, client);
    this.server.emit('user');
  }

  @SubscribeMessage('playPriv')
  async playPriv(
    @MessageBody() data: { player1: number, player2: number },
    @ConnectedSocket() client: Socket
  ) {
    // await this.gameService.deleteQueue(userid);
    await this.gameService.playPriv(data.player1, data.player2, client);
    this.server.emit('privGame', data.player1, data.player2);
  }

  @SubscribeMessage('acceptPriv')
  async acceptPriv(
    @MessageBody() data: { player1: number, player2: number },
    @ConnectedSocket() client: Socket
  ) {
    await this.gameService.acceptPriv(data.player1, data.player2, client);
    this.server.emit('user');
    // this.server.emit('', data.player2);
  }

  @SubscribeMessage('declinePriv')
  async declinePriv(
    @MessageBody() data: { player1: number, player2: number },
    @ConnectedSocket() client: Socket
  ) {
    this.server.emit('declinedPriv', data.player1, data.player2);
    // await this.gameService.deleteQueue(userid);
    // this.server.emit('', data.player2);
  }

  @SubscribeMessage('spectateGame')
  async spectateGame(
    @MessageBody() data: { myUserid: number, playerid: number },
    @ConnectedSocket() client: Socket
  ) {
    let game = await this.gameService.spectateGame(data.myUserid, data.playerid, client);
    // this.updateGameAndEmit(game.id, game);
    this.sockets[client.id] = client;
    this.server.emit('startSpectating', game);
  }
}


///////////////////////////////////////// USING IO for sockets.
// this could be used if needed? 
// // When a socket joins a game
// socket.join(gameId.toString());

// // When emitting an event to all sockets in a game
// this.io.to(gameId.toString()).emit('gameChanged', game);