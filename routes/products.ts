/**
 * @path /api/products
 */
import { Router } from "express";
import multer from 'multer';

//-Routes Middlewares
import { 
  createProductMiddlewares, 
  deleteProductMiddlewares, 
  getProductyByIdMiddlewares, 
  updateProductMiddlewares 
} from "../middlewares/products";

//-Routes Controllers
import { 
  createProductController, 
  deleteProductController, 
  getProductByIdController, 
  getProductsByNameController, 
  getProductsController, 
  updateProductController 
} from "../controller/products";

const router = Router();
const upload = multer({dest: '/tmp/'});

router.get('/', getProductsController);

router.get('/search', getProductsByNameController);

router.get('/:id', 
  getProductyByIdMiddlewares,
  getProductByIdController
);

router.post('/',
  upload.any(),
  createProductMiddlewares,
  createProductController
)

router.put('/:id',
  upload.any(),
  updateProductMiddlewares,
  updateProductController
)

router.delete('/:id',
  deleteProductMiddlewares,
  deleteProductController
)

export default router;
