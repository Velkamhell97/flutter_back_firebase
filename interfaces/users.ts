import { Request } from 'express';

export interface UsersRequest extends Request {
  body : UsersBody
}

interface UsersBody {
  name      : string,
  email     : string,
  password  : string,
  role      : string,
  avatar   ?: string
  // [rest: string] : string | boolean | undefined
}


