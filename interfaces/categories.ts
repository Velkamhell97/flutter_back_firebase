import { Request } from 'express';

export interface CategoriesRequest extends Request {
  body : CategoriesBody,
}

interface CategoriesBody {
  name : string,
  user : string
  // state ?: boolean //El estado no se manipula por el body
  // [rest: string] : string | boolean | undefined
}
