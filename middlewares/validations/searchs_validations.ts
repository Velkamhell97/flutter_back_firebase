import { Request, Response, NextFunction } from "express";
import { catchError, errorTypes } from "../../errors";

export const validateCollection = async (req: Request, res: Response, next: NextFunction) => {
  const { collection } = req.params;

  const collections = ['users', 'categories', 'products'];

  if(!collections.includes(collection.toLowerCase())) {
    return catchError({
      type: errorTypes.collection_not_found,
      extra: `Collection \'${collection}\' is not available, collections availables: ${collections}`,
      res
    });
  }

  next();
}