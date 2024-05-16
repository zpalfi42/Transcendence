import { IsEmail, IsNotEmpty, MinLength } from "class-validator";
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Cron } from "../../app.service";

@Entity()
export class CreateUserDto {
    @IsNotEmpty()
    @PrimaryGeneratedColumn()
    id: number;

    @Column('string')
    names: string;

    @Column({ type: 'string', default: "NOOB" })
    type: string;

    @Column('int', { array: true, default: [] })
    friends: string[];

    @Column('int', { array: true, default: [] })
    friendsId: number[];

    @Column('int', { array: true, default: [] })
    blocked: number[];

    @Column({ array: true, default: [] })
    chatRooms: number[];

    @Column({ array: true, default: [] })
    privateRooms: { userid: number, chatid: number, name: string }[];

    @Column('string', { array: true, default: [] })
    achievements: string[];

    @Column({
        type: 'jsonb',
        array: false,
        nullable: true,
      })
      logged: {n: number};

    @Column('string')
    picture: string;

    @Column('string')
    sayHi: string;

    results: {
        won: number;
        lost: number;
        total: number;
        points:number;
    };

    lastMatches: {
        game: number;
        against: string;
        result: string;
        icon: string;
    }[];
    @Column({
        type: 'jsonb',
        default: () => "'{\"state\": false, \"gameId\": 0}'",
    })
    isPlaying: { state: boolean; gameId: number };

    @Column('string')
    userPic: string;

    @Column('string')
    rank: string;

    @Column({ default: false })
    twoFactor: boolean;

    @Column({
        nullable: true,
        default: '',
      })
    auth: string;
}
