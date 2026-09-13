import { Request } from 'express';
import 'express-session';
import { User } from '../../user/entities/user.entity.js';

export interface SessionRequest extends Request {
  user?: User;
}
