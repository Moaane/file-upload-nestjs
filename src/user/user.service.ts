import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import axios from 'axios';
import { Response } from 'express';
import { CreateUserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private async validateUsername(username: string) {
    const isUsernameUnique = await this.prisma.user.findUnique({
      where: { username },
    });

    return !isUsernameUnique;
  }

  async create(
    body: CreateUserDto,
    file?: Express.Multer.File,
    res?: Response,
  ) {
    try {
      if (!file) {
        const isUserValid = await this.validateUsername(body.username);
        if (!isUserValid) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Username already in use',
            status: HttpStatus.BAD_REQUEST,
          });
        }

        const newUser = await this.prisma.user.create({ data: body });
        return res.status(HttpStatus.CREATED).json({
          data: newUser,
          message: 'User created successfully',
          status: HttpStatus.CREATED,
        });
      }

      const isUserValid = await this.validateUsername(body.username);
      if (!isUserValid) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Username already in use',
          status: HttpStatus.BAD_REQUEST,
        });
      }

      const formData = new FormData();
      const imageName = `${body.username}_profile`;
      formData.append('image', file.buffer.toString('base64'));
      const response = await axios.post(
        `https://api.imgbb.com/1/upload?name=${imageName}&key=${process.env.IMG_API_KEY}`,
        formData,
      );

      if (response.status !== 200) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Failed to upload file',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      }

      const imageUrl = response.data.data.display_url;
      const newUser = await this.prisma.user.create({
        data: { ...body, profileImage: imageUrl },
      });

      return res.status(HttpStatus.CREATED).json({
        data: newUser,
        message: 'User created successfully',
        status: HttpStatus.CREATED,
      });
    } catch (error) {
      console.log(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to create user',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
