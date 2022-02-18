import { Response } from 'express';

import { catchError, errorTypes } from '../errors';
import { User } from '../models';
import { generateJWT } from "../helpers";
import { UsersRequest } from "../interfaces/users";
import { auth } from '../database/firebase';
import cloudinary from '../models/cloudinary';


/**
 * @controller /api/users/ : GET
 */
 export const getUsersController = async (req: UsersRequest, res: Response) => {
  const { limit = 5, from = 0 } = req.query;
  const query = { state: true };

  try {
    // const users = await User.findAll({limit: Number(limit), skip: Number(from)});
    const users = await User.whereEqual({state:true}, {limit: Number(limit), skip: Number(from)}).getResults();
  
    res.json({msg: 'Users get successfully', users, count: users.length});
  } catch (error) {
    return catchError({error, type: errorTypes.get_users, res});
  }
}


/**
 * @controller /api/users/:id : GET 
 */
 export const getUserByIdController = async (_req: UsersRequest, res: Response) => {
  const user: User = res.locals.user;
  res.json({msg: 'Users by ID get successfully', user});
}


/**
 * @controller /api/users/:id/categories : GET
 */
 export const getUserCategoriesController = async (_req: UsersRequest, res: Response) => {
  const user: User = res.locals.user;

  try {
    const categories = await user.getCategories();
    
    res.json({msg: 'User categories get successfully', categories});
  } catch (error) {
    return catchError({error, type: errorTypes.get_user_categories, res});
  }
}


/**
 * @controller /api/users/ : POST
 */
export const createUserController = async (req: UsersRequest, res: Response) => {
  const { password, ...userData } = req.body;

  const avatar: Express.Multer.File | undefined = res.locals.file;
  
  try {
    const { uid } = await auth.createUser({
      email: userData.email, 
      password,
      disabled: false, //Como el tipo de state,
      displayName: userData.name,
      photoURL: userData.avatar,
    })

    if(avatar){
      try {
        const response = await cloudinary.uploadImage({path: avatar.path, filename: uid, folder: 'users'})
        userData.avatar = response.secure_url;
      } catch (error) { 
        return catchError({error, type: errorTypes.upload_cloudinary, res});
      }
    }

    //-No se puede validar este token con el auth
    // const token = await auth.createCustomToken(uid);
    const user = new User({id: uid,...userData});
    await user.save();

    generateJWT(user.id!).then((token) => {
      return res.json({msg: 'User saved successfully', user, token});
    }).catch((error) => {
      return catchError({error, type: errorTypes.generate_jwt, res});
    })
  } catch (error) {
    return catchError({error, type: errorTypes.save_user, res});
  }
}


/**
 * @controller /api/users/:id : PUT
 */
 export const updateUserController = async (req: UsersRequest, res: Response) => {
  const { id } = req.params;
  const userData = req.body;
  const user: User = res.locals.user;

  const avatar: Express.Multer.File | undefined = res.locals.file; 

  if(avatar){
    try {
      const response = await cloudinary.uploadImage({path: avatar.path, filename: id, folder: 'users'});
      userData.avatar = response.secure_url;
    } catch (error) { 
      return catchError({error, type: errorTypes.upload_cloudinary, res});
    }
  }

  try {
    await auth.updateUser(id, { 
      disabled: true,
      displayName: userData.name,
      photoURL: userData.avatar,
      password: userData.password,
      email: userData.email
    });
    await user.update(userData);

    return res.json({msg: 'User update successfully', user});
  } catch (error) {
    return catchError({error, type: errorTypes.update_user, res});
  }
}


/**
 * @controller /api/users/:id : DELETE
 */
export const deleteUserController = async (req: UsersRequest, res: Response) => {
  const { id } = req.params;
  const user: User = res.locals.user;

  try {
    // const user = await User.findByIdAndUpdate(id, {state: false});
    // await user.destroy();
    await auth.updateUser(id, { disabled: true }); //Para deshabilitar
    await user.update({state: false});

    return res.json({msg: 'User delete successfully', user});
  } catch (error) {
    return catchError({error, type: errorTypes.delete_user, res});
  }
}