
import { User } from "./user.entity";
import { Message, } from '../messages/entities/message.entity';
import { ChatRoom } from '../messages/entities/chatRoom.entity';
import { Game, GameSocks } from '../game/entities/game.entity';

const entities = [User, Message, ChatRoom, Game, GameSocks];

export { User, Message, ChatRoom, Game, GameSocks };
export default entities;

//ADD HERE Any entities No metadata problem solver 