/**
 * @path /api/searchs
 */
import { Router } from "express";

//-Routes Middlewares
import { searchMiddlewares } from "../middlewares/searchs";

//-Routes Controllers
import { searchController } from "../controller/searchs";

const router = Router();

router.get('/:collection/:query', 
  searchMiddlewares,
  searchController
)

export default router;