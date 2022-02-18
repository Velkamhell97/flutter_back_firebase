import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator/src/validation-result";

import { catchError, errorTypes } from "../../errors";
import { Role, User } from "../../models";
import { verifyJWT } from "../../helpers";


/**
 * @middleware validate jwt header (return auth user)
 */
export const validateJWT = async (req : Request, res : Response, next: NextFunction) => {
  const token = req.header('x-token');

  if(!token){
    return catchError({type: errorTypes.no_token, res});
  }

  verifyJWT(token).then(async (payload) => {
    const authUser = await User.findById(payload.uid);

    if(!authUser || authUser.state == false){
      return catchError({type: errorTypes.auth_user_not_found, res});
    }

    res.locals.authUser = authUser
    
    next();
  }).catch((error) => {
    return catchError({error, type: errorTypes.invalid_token, res});
  })
}


/**
 * @middleware validate body schemas
 */
export const validateBody = (req : Request, res : Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if(!errors.isEmpty()) {
    return res.status(400).json(errors)
  }

  next();
}


/**
 * @middleware validate user permissions
 */
export const validatePermissions = async (_req : Request, res : Response, next: NextFunction) => {
  const authUser: User = res.locals.authUser;

  const validRoles = ['ADMIN_ROLE', 'WORKER_ROLE'];

  const authUserRole = await Role.findById(authUser.role);

  if(!authUserRole || !validRoles.includes(authUserRole.name)){
    return catchError({
      type: errorTypes.permissions,
      extra: `Only the roles: ${validRoles} can modify registers, actual role: ${authUserRole!.name}`,
      res
    });
  } 

  next();
}

/**
 * @middleware validate single file upload
 */
export const validateSingleFile = (field: string, extensions: string[]) => async(req: Request, res: Response, next: NextFunction) => {
  const files = req.files as Express.Multer.File[] | undefined;

  if(!files || !files.length){ //->Si no hay nada pasa
    return next();
  } 

  //Si hay mas de uno o ese uno no corresponde al esperado
  if(files.length > 1 || files[0].fieldname != field){ 
    // deleteFilesLocal(files.map(f => f.path)); //->Si se almacena en el tmp no es muy util

    return catchError({
      type: errorTypes.missing_files,
      extra: `The file \'${field}\' was expected, recibed: ${files.map(f => f.fieldname)}`,
      res
    })
  }

  const file = files[0];
  const ext = file.originalname.split('.').at(-1)!;

  if(!extensions.includes(ext)){
    // deleteFilesLocal([file.path]);

    return catchError({
      type: errorTypes.invalid_file_extension,
      extra: `The file \'${field}\' have an invalid extension, valid extensions: ${extensions}`,
      res
    });
  } else {
    //->para no volver a hacer la validacion de los files en el controller, si no envia llegara undefined
    res.locals.file = file;
  }

  next();
}