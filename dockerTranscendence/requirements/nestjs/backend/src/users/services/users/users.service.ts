import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../../typeorme';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../../../users/dtos/CreateUser.dto';
import { UpdateUserDto } from '../../../users/dtos/UpdateUser.dto';
import { UsersController } from '../../controllers/users/users.controller';
import * as path from 'path';
import * as fs from 'fs';
UpdateUserDto
@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) { }

  async uploadFile(file: any, id: number) {
    const destinationFolder = path.join(__dirname, '../../../../../users/usersData');

    // Check dest folder 
    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder, { recursive: true });
    }
    else
      console.log("i do existtt!   ", file.originalname, " and id is :", id)
    const customFile: string = id + file.originalname;
    const filePath = path.join(destinationFolder, customFile);

    try {
      // Move the uploaded file to the destination folder
      fs.writeFileSync(filePath, file.buffer);
      const baseUrl = 'http://localhost:3000';
      const fileUrl = `${baseUrl}/users/usersData/${customFile}`;

      // Has to save the path to my userspic in the DB


      return { message: 'Upload successful', fileUrl };
    } catch (error) {
      // Handle any errors
      console.error('Error uploading file:', error);
      throw new Error('File upload failed');
    }

    return { message: 'Upload successful' };
  }

  async createUser(createUserDto: CreateUserDto) {
    const newUser = this.userRepository.create(createUserDto);
    newUser.privateRooms = [];
    newUser.isPlaying = { state: false, gameId: 0 };

    const destinationFolder = path.join(__dirname, '../../../../../users/usersData');

    // Check dest folder 
    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder, { recursive: true });
    }

    const file = {
      originalname: 'default.png',
      buffer: fs.readFileSync(path.resolve(__dirname, '../../../../../src/users/img/img.png')),
    }

    const filePath = path.join(destinationFolder, "img.png");

    fs.writeFileSync(filePath, file.buffer);

    const baseUrl = 'http://localhost:3000';
    const fileUrl = "/src/users/img/img.png";

    let url = `${baseUrl}/users/usersData/img.png`;

    console.log(url);

    newUser.userPic = url;
    // console.log(createUserDto);
    return this.userRepository.save(newUser);
  }

  onModuleInit() {
    this.scheduleIdleUserCheck();
  }

  private scheduleIdleUserCheck() {
    setInterval(() => {
      this.handleIdleUsers();
    }, 5000); // 5 secs gap for a check
  }

  async handleIdleUsers() {
    const idleThreshold = 500000; //3 * 60 * 1000; // 3 minutes in ms
    const onlineUsers = await this.userRepository.find();

    for (const user of onlineUsers) {
      // console.log("User ID:", user.id);
      // console.log("Logged.n:", user.logged.n);
      // console.log("Time Difference:", Date.now() - user.logged.n);
      if (user.logged !== null) {
        if (user.logged.n > 3 && Date.now() - user.logged.n > idleThreshold) {
          user.logged.n = 0;
          await this.userRepository.save(user);
        }
      }
    }
  }


  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const userToUpdate = await this.userRepository.findOne({ where: { id: id } });

    if (!userToUpdate) {
      console.log(" User doesnt exist!");
    }

    for (const key in updateUserDto) {
      if (updateUserDto.hasOwnProperty(key) && updateUserDto[key] !== undefined) {
        if (Array.isArray(updateUserDto[key]) && Array.isArray(userToUpdate[key])) {
          // If the property is an array, append it to the existing array
          userToUpdate[key] = userToUpdate[key].concat(updateUserDto[key]);
        } else {
          // For non-array properties, simply update
          userToUpdate[key] = updateUserDto[key];
        }
      }
    }

    return this.userRepository.save(userToUpdate);
  }

  async patchUser(id: number, updateUserDto: UpdateUserDto) {
    // Fetch the user to be updated based on their id
    const userToUpdate = await this.userRepository.findOne({ where: { id: id } });
    if (!userToUpdate) {
      console.log(" User doesnt exist!");
    }
    // Apply changes from the UpdateUserDto to the user entity
    for (const key in updateUserDto) {
      if (updateUserDto.hasOwnProperty(key) && updateUserDto[key] !== undefined) {
        // For non-array properties, simply update
        userToUpdate[key] = updateUserDto[key];
      }
    }

    return this.userRepository.save(userToUpdate);
  }


  getUsers() {
    return this.userRepository.find();
  }

  async findUsersById(id: number): Promise<User> | null {
    const user = await this.userRepository.findOne({ where: { id: +id } });

    if (!user) {
      console.log("User NOT found! : ", id);
      return null;
    }

    // console.log("User found:", user);
    return user;
  }

}
