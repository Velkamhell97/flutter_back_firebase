import { Request,} from 'express';
import { Product } from '../models';

export interface ProductsRequest extends Request {
  body : ProductsBody
}

interface ProductsBody {
  name         : string,
  user         : string,
  price       ?: number,
  img         ?: string,
  category     : string,
  description ?: string,
  available   ?: boolean,
  // [rest: string] : string | boolean | undefined
}


