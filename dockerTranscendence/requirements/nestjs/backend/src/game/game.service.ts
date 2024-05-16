import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Game, Paddle, GameSocks } from './entities/game.entity';
import { Server, Socket, } from 'socket.io';
import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { UpdateUserDto } from "../users/dtos/UpdateUser.dto"
import { UsersService } from "../users/services/users/users.service";


interface GameInterface {
  player1: Paddle;
  opponentPlayer: Paddle;
  ball: Ball;
}

// interface Paddle {
//   playerid: number;
//   x: number;
//   y: number;
//   xVel: number;
//   yVel: number;
//   speed: number;
//   width: number;
//   height: number;
// }

interface opponentPaddle {
  playerid: number;
  width: number;
  height: number;
  x: number;
  y: number;
  xVel: number;
  yVel: number;
  speed: number;
}

interface Ball {
  width: number;
  height: number;
  x: number;
  y: number;
  xVel: number;
  yVel: number;
  speed: number;
}

const delay = ms => new Promise(res => setTimeout(res, ms));

@Injectable()
export class GameService {
  private Queue: any[] = [];
  private sockets: Socket[] = [];
  private sockMap: Map<String, Socket>  = new Map();
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(Game) private gameRepository: Repository<Game>,
    @InjectRepository(GameSocks) private gameSocks: Repository<GameSocks>,
    private usersService: UsersService,
  ) { }

  async create(createGameDto: CreateGameDto, userid: number, socket: Socket, mode: boolean): Promise<Game>
  {
    const newGame = new Game();
    const newGameSock = new GameSocks();
    let player = new Paddle();
    player.playerId = userid;
    player.yVel = 0;
    newGame.player1 = player;
    newGame.sockets = [];
    newGame.sockets.push(socket.id);
    if (mode)
      this.sockets.push(socket);
    newGameSock.sockets = [];
    newGameSock.sockets.push(socket.id);
    const savedGame = await this.gameRepository.save(newGame);
    const sgs = await this.gameSocks.save(newGameSock);
    return savedGame;
  }

  findAll() {
    return `This action returns all game`;
  }

  async findOne(id: number) {
    const game = await this.gameRepository.findOne(({ where: { id: id } }));
    return game;
  }

  async findSocks(id: number) {
    const socks = await this.gameSocks.findOne(({ where: { id: id }}));
    return socks;
  }

  async update(id: number, updateGameDto: UpdateGameDto): Promise<Game> {
    // Attempt to find the game by its ID
    const game = await this.gameRepository.findOne(({ where: { id: id } }));
    // console.log("-------->");
    // console.log(game.sockets);
    // console.log(updateGameDto.sockets);
    // console.log("<--------");

    if (game.sockets.length !== 0 && game.sockets.length > updateGameDto.sockets.length)
      updateGameDto.sockets = game.sockets;
    else if (updateGameDto.sockets.length > game.sockets.length)
      game.sockets = updateGameDto.sockets;

    // If the game is not found, throw a NotFoundException
    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }

    // Update the game entity with the data from updateGameDto
    this.gameRepository.merge(game, updateGameDto);

    // Save the updated game to the database
    return this.gameRepository.save(game);
  }

  remove(id: number) {
    return `This action removes a #${id} game`;
  }
  
  async getAllGames() {
    return this.gameRepository.find();
  }

  async gameQueue(userid: number, socket: Socket) {
    let user = await this.usersService.findUsersById(+userid);
    if (user.isPlaying.state === true) // IF USER IS ALREADY IN GAME
    {
      let game = await this.findOne(+user.isPlaying.gameId);
      let gamesock = await this.gameSocks.findOne(({ where: { id: game.id } }));
      gamesock.sockets.push(socket.id);
      await this.gameSocks.save(gamesock);
      // game.sockets.push(socket.id);
      // await this.update(game.id, game);
      // console.log("GAME START FOR " + user.id);
      socket.emit('gameStart', game);
      return ;
    }
    if (user.isPlaying.gameId !== 0) // IF THE GAME HAS NOT STARTED YET BUT WAS ASSIGNED (private games)
    {
      let game = await this.findOne(+user.isPlaying.gameId);
      if (game.player2 !== null && game.player1 !== null)
      {
        if (+user.id === +game.player1.playerId)
        {
          await delay(100);
        }
        // game = await this.findOne(+user.isPlaying.gameId);
        let gamesock = await this.gameSocks.findOne(({ where: { id: game.id } }));
        gamesock.sockets.push(socket.id);
        await this.gameSocks.save(gamesock);
        // game.sockets.push(socket.id);
        // await this.update(game.id, game);
        // console.log("GAME START FOR " + user.id);
        socket.emit('gameStart', game);
        return ;
      }
      else
        return ;
    }
    if (this.Queue.length < 1) // NORMAL QUEUE IF NO ONE IS SEARCHING FOR GAME
    {
      let user = await this.usersService.findUsersById(+userid);
      let game = await this.create(new CreateGameDto(), userid, socket, true);
      let date = new Date();
      this.Queue.push({id: +game.id, time: date.getTime()});
      user.isPlaying.gameId = +game.id;
      user.logged.n = 2;
      await this.usersService.patchUser(userid, user);
    }
    else // NORMAL QUEUE IF THERE IS SOMEONE SEARCHING FOR GAME
    {
      let gameData = this.Queue.shift();
      let date = new Date();
      if (date.getTime() - gameData.time > 20000)
      {
        let game = await this.create(new CreateGameDto(), userid, socket, true);
        let date = new Date();
        this.Queue.push({id: +game.id, time: date.getTime()});
        let user = await this.usersService.findUsersById(+userid);
        user.logged.n = 2;
        await this.usersService.patchUser(userid, user);
        return ;
      }
      let game = await this.findOne(gameData.id);
      let gamesock = await this.gameSocks.findOne(({ where: { id: gameData.id } }));
      let user = await this.usersService.findUsersById(+game.player1.playerId);
      let user2 = await this.usersService.findUsersById(+userid);

      let player = new Paddle();
      player.playerId = +userid;
      player.yVel = 0;

      game.player2 = player;
      game.sockets.push(socket.id);

      this.sockets.push(socket);
      
      await this.update(game.id, game);
      const player1 = this.sockets.shift();
      const player2 = this.sockets.shift();
      user2.isPlaying.gameId = game.id;
      user.logged.n = 3;
      user2.logged.n = 3;
      gamesock.sockets.push(player1.id);
      gamesock.sockets.push(player2.id);      
      await this.usersService.patchUser(userid, user2);
      await this.usersService.patchUser(+game.player1.playerId, user);
      await this.gameSocks.save(gamesock);
      // console.log("GAME START FOR BOTH " + user.id);
      player1.emit('gameStart', game);
      socket.emit('gameStart', game);
    }
  }

  async deleteQueue(userid: number, socket: Socket) {
    let user = await this.usersService.findUsersById(+userid);
    if (user === null)
      return ;
    this.Queue = this.Queue.filter((g) => +g.id !== +user.isPlaying.gameId);
    this.sockets = this.sockets.filter((s) => s.id !== socket.id);
    user.isPlaying.gameId = 0;
    user.isPlaying.state = false;
    user.logged.n = 1;
    await this.usersService.patchUser(userid, user);
  }

  async playPriv(player1id: number, player2id: number, socket: Socket) {
    let user = await this.usersService.findUsersById(+player1id);
    let game = await this.create(new CreateGameDto(), player1id, socket, false);
    if (user === null || game === null)
      return ;
    user.isPlaying.gameId = +game.id;
    this.sockMap[socket.id] = socket;
    user.logged.n = 2;
    await this.usersService.patchUser(player1id, user);
  }

  async acceptPriv(player1id: number, player2id: number, socket: Socket) {
    let user1 = await this.usersService.findUsersById(+player1id);
    let user2 = await this.usersService.findUsersById(+player2id);
    let game = await this.findOne(+user1.isPlaying.gameId);

    if (user1 === null || user2 === null || game === null)
      return ;

    let player = new Paddle();
    player.playerId = +player2id;
    player.yVel = 0;
    game.player2 = player;

    let sock = game.sockets.shift();
    await this.update(game.id, game);

    user1.logged.n = 3;
    user2.logged.n = 3;
    user2.isPlaying.gameId = +game.id;
    await this.usersService.patchUser(player2id, user2);
    await this.usersService.patchUser(player1id, user1);
    this.sockMap[sock].emit('gamePriv', true);
    socket.emit('gamePriv', true);
  }

  async declinePriv(player1id: number, player2id: number)
  {
    let user1 = await this.usersService.findUsersById(+player1id);
    let user2 = await this.usersService.findUsersById(+player2id);
    let game = await this.findOne(+user1.isPlaying.gameId);

    if (user1 !== null)
    {
      user1.isPlaying.gameId = 0;
      user1.isPlaying.state = false;
      user1.logged.n = 1;

      await this.usersService.patchUser(player1id, user1);
    }

    if (user2 !== null)
    {
      user2.isPlaying.gameId = 0;
      user2.isPlaying.state = false;
      user2.logged.n = 1;

      await this.usersService.patchUser(player2id, user2);
    }
    if (game !== null)
    {
      let sock = game.sockets.shift();
      this.sockMap[sock].emit('gamePriv', false);
    }
  }

  async spectateGame(myUserid: number, playerid: number, socket: Socket)
  {
    let user2 = await this.usersService.findUsersById(+playerid);
    let game = await this.findOne(+user2.isPlaying.gameId);

    if (game !== null)
    {
      let gamesock = await this.gameSocks.findOne(({ where: { id: game.id } }));
      gamesock.sockets.push(socket.id);
      await this.gameSocks.save(gamesock);
      // game.sockets.push(socket.id);
    
      // await this.update(game.id, game);
      // console.log(game);
    }
    return (game);
  }
}
