import { Request } from 'express';
import { Users } from '../src/models/user.model';

declare global {
  namespace Express {
    interface Request {
      user: Users; // Replace `any` with your user type if defined
    }
  }
}
