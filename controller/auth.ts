import { Request, Response } from "express"
import { UserRecord } from "firebase-admin/auth";

import { AuthRequest } from "../interfaces/auth";
import { catchError, errorTypes } from "../errors";
import { User } from "../models";
import { auth } from "../database/firebase";
import { generateJWT, googleVerify } from "../helpers";


/**
 * @controller /auth/renew : GET
 */
export const renewTokenController = async (_req: AuthRequest, res: Response) => {
  const user: User = res.locals.authUser;

  generateJWT(user.id).then((token) => {
    res.json({msg: 'Token renew', user, token});
  }).catch((error) => {
    return catchError({error, type: errorTypes.generate_jwt, res});
  })
}


/**
 * @controller /api/auth/login : POST
 */
export const loginController = async (_req: AuthRequest, res: Response) => {
  const user: UserRecord = res.locals.logedUser;

  try {
    const dbUser = await User.findById(user.uid);
    
    generateJWT(user.uid).then((token) => {
      return res.json({msg: 'User saved successfully', user: dbUser, token});
    }).catch((error) => {
      return catchError({error, type: errorTypes.generate_jwt, res});
    })
  } catch (error) {
    return catchError({error, type: errorTypes.generate_jwt, res});
  }
}


/**
 * @controller /api/auth/google : POST
 */
 export const googleSignInController = async (req: Request, res: Response) => {
  const { id_token } = req.body;

  try {
    const {name, email, picture} = await googleVerify(id_token);

    let user = await User.whereEqualOne({email});

    if(!user) {
      //->passwords menores a 6 letras no pasan el login normal solo valido por google
      await auth.createUser({
        displayName: name,
        email,
        password: 'less6',
        photoURL: picture,
      });

      user = new User({name: name!, email: email!, avatar: picture, google: true, role: "mfDzkgFBsgtZ2FMqIZ7b"});
      await user.save();
    }

    if(!user.state) {
      return catchError({error: user, type:errorTypes.user_blocked, res});
    }

    generateJWT(user.id).then((token) => {
      return res.json({msg: 'Google sign in successfully', user, token})
    }).catch((error) => {
      return catchError({error, type: errorTypes.generate_jwt, res});
    })
  } catch (error) {
    return catchError({error, type: errorTypes.google_signin, res});
  }
}
