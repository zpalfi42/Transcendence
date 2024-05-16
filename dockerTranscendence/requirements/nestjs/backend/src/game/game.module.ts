import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { TypeOrmModule } from '@nestjs/typeorm'; // Import TypeOrmModule
import { Game, GameSocks } from './entities/game.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Game]), TypeOrmModule.forFeature([GameSocks]), UsersModule], // Add UsersModule to the imports
  providers: [GameGateway, GameService],
  exports: [GameGateway, GameService],
})
export class GameModule { }
