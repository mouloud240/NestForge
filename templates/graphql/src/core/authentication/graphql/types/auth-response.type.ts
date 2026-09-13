import { Field, ObjectType } from '@nestjs/graphql';
import { UserType } from './user.type.js';

/**
 * GraphQL response type for authentication operations
 *
 * Returns authenticated user details
 */
@ObjectType('AuthResponse')
export class AuthResponseType {
  @Field(() => UserType, { description: 'Authenticated user details' })
  user: UserType;
}
