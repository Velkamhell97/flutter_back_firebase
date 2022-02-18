/**
 * @path /api/roles
 */
import { NextFunction, Request, Response, Router } from "express";

import { Role } from "../models";

const router = Router();

router.post('/', async (req : Request, res : Response, next: NextFunction) => {
  const { name } = req.body;
  
  try {
    const role = new Role({name});
    await role.save();
    
    return res.json({
      msg: 'Role saved successfully',
      role
    })
  } catch (error) {
    return res.status(500).json({
      error,
      msg: 'Role saved failed',
    })
  }
});

export default router;