import { User } from '@prisma/client';

export class UserEntity implements User {
  id: number;
  fullName: string;
  username: string;
  password: string;
  profileImage: string;
}
