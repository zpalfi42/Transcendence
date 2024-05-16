import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Cron } from "../app.service";

@Entity()
export class User {
  @PrimaryColumn({
    type: 'bigint',
    name: 'user_id',
  })
  id: number;

  @Column({
    nullable: false,
    default: '',
  })
  names: string;

  @Column({
    nullable: false,
    default: '',
  })
  type: string;

  @Column('text', { array: true, default: '{}', nullable: false })
  friends: string[];

  @Column('int', { array: true, default: '{}', nullable: false })
  friendsId: number[];

  @Column('int', { array: true, default: '{}', nullable: false })
  blocked: number[];

  @Column('int', { array: true, default: '{}' })
  chatRooms: number[];

  @Column({ type: 'jsonb', array: false, default: () => "'[]'", nullable: false })
  privateRooms: { userid: number, chatid: number, name: string }[];

  @Column('text', { array: true, default: '{}', nullable: false })
  achievements: string[];

  @Column({
    type: 'jsonb',
    array: false,
    nullable: true,
  })
  logged: {n: number};

  @Column({
    nullable: false,
    default: '',
  })
  picture: string;

  @Column({
    nullable: false,
    default: '',
  })
  sayHi: string;

  @Column('jsonb', { nullable: false, default:  { "won": 0, "lost": 0, "total": 0, "points": 0 } })
  results: { won: number; lost: number; total: number; points: number};

  @Column('jsonb', { nullable: false, default: [] })
  lastMatches: {
    game: number;
    against: string;
    result: string;
    icon: string;
  }[];
  @Column({ 
    nullable: false,
    default: false 
  })
    twoFactor: boolean;

  @Column({
    type: 'jsonb',
    nullable: false,
    default: { state: false, gameId: 0 },
  })
  isPlaying: { state: boolean; gameId: number };

  @Column({
    nullable: false,
    default: 'theWarrior',
  })
  userPic: string;

  @Column({
    nullable: false,
    default: '',
  })
  rank: string;

  @Column({
    nullable: true,
    default: '',
  })
  auth: string;
}


