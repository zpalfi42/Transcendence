import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Patch,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  Res
} from '@nestjs/common';
import { CreateUserDto } from '../../dtos/CreateUser.dto';
import { UpdateUserDto } from '../../dtos/UpdateUser.dto';
import { UsersService } from '../../../users/services/users/users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { Multer } from 'multer';
import { Express, Response } from 'express'
import { randomInt } from 'crypto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) { }

  @Get()
  getUsers() {
    return this.userService.getUsers();
  }

  @Get('id/:id')
  findUsersById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findUsersById(id);
  }

  @Post('create')
  @UsePipes(ValidationPipe)
  createUsers(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Put('update/:id')
  @UsePipes(ValidationPipe)
  updateUsers(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Patch('patch/:id')
  patchUsers(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.patchUser(id, updateUserDto);
  }

  @Post('/upload/:id')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Param('id') id: string) {
    const destinationFolder = path.join(__dirname, '../../../../../users/usersData');

    // Check dest folder 
    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder, { recursive: true });
    }
    else
      console.log("i do existtt!   ", file.originalname, " and id is :", id)
    let r = randomInt(+id);
    const customFile: string = id + r.toString();
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


  @Get('usersData/:filename')
  async serveImage(@Param('filename') filename: string, @Res() res: Response) {
    const locationFolder = path.join(__dirname, '../../../../../users/usersData');
    const filePath = path.join(locationFolder, filename);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  }
}
