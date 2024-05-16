import { PartialType } from '@nestjs/mapped-types';
import { CreateGameDto, CreateGameSocksDto } from './create-game.dto';

export class UpdateGameDto extends PartialType(CreateGameDto) {
  id: number;
}

export class UpdateGameSocksDto extends PartialType(CreateGameSocksDto) {
  id: number;
}