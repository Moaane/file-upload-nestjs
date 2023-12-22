import { OmitType, PartialType } from '@nestjs/mapped-types';
import { UserEntity } from 'src/entities/user.entity';

export class CreateUserDto extends OmitType(UserEntity, ['id']) {
  fullName: string;
  username: string;
  password: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  fullName?: string;
  password?: string;
  username?: string;
  profileImage?: string;
}
