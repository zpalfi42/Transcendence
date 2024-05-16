import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { MessagesService } from './messages/messages.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import * as path from 'path';
import entities from './typeorme';
import { AuthController } from './authme/authIt'
// import { UsersService } from 'users/services/users/users.service';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    MulterModule.register({
      dest: path.join(__dirname, '../usersData'), // Use a relative path
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: 'postgres', // Using environment variables
        port: 5432,
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        apiSecret: process.env.apiSecret,
        client_id: process.env.apiUid,
        entities: entities,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    MessagesModule,
    GameModule
  ],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule { }
