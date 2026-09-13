import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../../user/entities/user.entity.js';
import { UserResponseDto } from './user-response.dto.js';

export class AuthResponseDto {
  @ApiProperty({
    description: 'The user object containing user details',
    type: () => UserResponseDto,
  })
  user: UserResponseDto;

  constructor(user: User) {
    this.user = new UserResponseDto(user);
  }
}
