/**
 * @path /api/categories
 */
import { Router } from "express";

//-Routes Middlewares
import {
  getCategoryByIdMiddlewares,
  createCategoryMiddlewares,
  updateCategoryMiddlewares,
  deleteCategoryMiddlewares,
  getCategoriesProductsMiddlewares,
} from "../middlewares";

//-Routes Controllers
import {
  createCategoryController,
  deleteCategoryController,
  getCategoriesByNameController,
  getCategoriesController,
  getCategoriesProductsController,
  getCategoryByIdController,
  updateCategoryController
} from "../controller/categories";

const router = Router();

router.get('/', getCategoriesController);

router.get('/search', getCategoriesByNameController)

router.get('/:id',
  getCategoryByIdMiddlewares,
  getCategoryByIdController
);

router.get('/:id/products',
  getCategoriesProductsMiddlewares,
  getCategoriesProductsController
)

router.post('/',
  createCategoryMiddlewares,
  createCategoryController
);

router.put('/:id',
  updateCategoryMiddlewares,
  updateCategoryController
);

router.delete('/:id',
  deleteCategoryMiddlewares,
  deleteCategoryController
);

export default router;