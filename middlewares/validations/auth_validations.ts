import { Response, NextFunction } from 'express';

import { catchError, errorTypes } from '../../errors';
import { AuthRequest } from '../../interfaces/auth';
import { auth } from '../../database/firebase';
import { FirebaseScrypt, FirebaseScryptOptions } from 'firebase-scrypt'

/**
 * @middleware validate login
 */
 export const validateLogin = async (req : AuthRequest, res : Response, next: NextFunction) => {
  const { email, password } = req.body;
  
  const user = (await auth.listUsers()).users.find(user => user.email == email);
  
  if(!user || user.disabled == true){
    return catchError({type: errorTypes.login, res});
  }

  const firebaseHashParameters: FirebaseScryptOptions = {
    memCost: 14,
    rounds: 8,
    saltSeparator: process.env.FIREBASE_SALT_SEPARATOR!,
    signerKey: process.env.FIREBASE_SIGNER_KEY!
  }

  const scrypt = new FirebaseScrypt(firebaseHashParameters);
  const matchPassword = await scrypt.verify(password, user.passwordSalt!, user.passwordHash!);

  if(!matchPassword) {
    return catchError({type: errorTypes.login, res})
  } else {
    res.locals.logedUser = user;
  }

  next()
}