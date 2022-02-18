import { Response, NextFunction } from 'express';

import { catchError, errorTypes } from '../../errors';
import { CategoriesRequest } from '../../interfaces/categories';
import { Category, User } from '../../models';

/**
 * @middleware validate category id passed by params
 */
 export const validateCategoryID = async (req : CategoriesRequest, res : Response, next: NextFunction) => {
  const { id } = req.params;

  const dbCategory = await Category.findById(id);

  if(!dbCategory || !dbCategory.state){
    return catchError({type: errorTypes.category_not_found, res});
  } else {
    res.locals.category = dbCategory;
  }

  next();
}

/**
 * @middleware validate category name (create and update is valid)
 */
export const validateCategory = async (req : CategoriesRequest, res : Response, next: NextFunction) => {
  const { id } = req.params;
  const { name } = req.body;

  if(!name){
    return next();
  }

  const trim = name.split(' ').filter(i => i).join(' ').toLowerCase();
  const dbCategory = await Category.whereEqualOne({lower: trim});

  if(dbCategory && dbCategory.id == id){ //Para dejar actualizar el mismo nombre
    return next();
  }

  if(dbCategory){
    return catchError({
      type: errorTypes.duplicate_category,
      extra: `The category with the name: \'${dbCategory.name}\' already exist`,
      res, 
    });
  }

  next();
}


/**
 * @middleware validate the author of category
 */
 export const validateCategoryAuthor = async (_req : CategoriesRequest, res : Response, next: NextFunction) => {
  const category: Category  = res.locals.category;
  const authUser: User = res.locals.authUser;

  if(category.user != authUser.id){
    return catchError({type: errorTypes.category_unauthorized, res});
  }

  next();
}