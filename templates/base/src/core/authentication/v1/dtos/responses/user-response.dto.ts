import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../../user/entities/user.entity.js';

export class UserResponseDto {
  @ApiProperty({ description: 'User unique identifier' })
  id: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ description: 'Whether the email has been verified' })
  isMailVerified: boolean;

  @ApiProperty({ description: 'Display username', required: false })
  username?: string;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.isMailVerified = user.isMailVerified;
    this.username = user.username;
  }
}
