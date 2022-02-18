/**
 * @path /api/auth
 */
import { Router } from "express";

//-Routes Middlewares
import {
  renewTokenMiddlewares,
  loginMiddlewares,
  googleSignInMiddlewares,
} from '../middlewares';

//-Routes Controllers
import { 
  googleSignInController,
  loginController, 
  renewTokenController 
} from "../controller/auth";

const router = Router();

router.get('/renew', 
  renewTokenMiddlewares,
  renewTokenController
);

router.post('/login', 
  loginMiddlewares,
  loginController
); 

router.post('/google', 
  googleSignInMiddlewares,
  googleSignInController
); 

export default router;