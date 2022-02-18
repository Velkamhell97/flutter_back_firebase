import { Request } from 'express';

export interface AuthRequest extends Request {
  body : AuthBody,
}

interface AuthBody {
  email : string,
  password : string
}

