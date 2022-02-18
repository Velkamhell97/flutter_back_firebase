import { Response } from "express";

import { catchError, errorTypes } from "../errors";
import { CategoriesRequest } from "../interfaces/categories";
import { Category, User } from "../models";


/**
 * @controller /api/categories/ : GET
 */
export const getCategoriesController = async(_req: CategoriesRequest, res: Response) => {
  try {
    const categories = await Category.whereEqual({state: true}).getResults();

    return res.json({msg:'Get all categories successfully', categories});
  } catch (error) {
    return catchError({error, type: errorTypes.get_categories, res});
  }
}


/**
 * @controller /api/categories/search?name=:name : GET
 */
 export const getCategoriesByNameController = async(req: CategoriesRequest, res: Response) => {
  const { name } = req.query;

  const lower = name?.toString().toLowerCase();

  try {
    const categories = await Category.whereStartsWith({lower}).getResults(); //--> Prefix Match (starts with)

    return res.json({msg:'Get categories by name successfully', categories});
  } catch (error) {
    return catchError({error, type: errorTypes.get_categories_by_name, res});
  }
}


/**
 * @controller /api/categories/:id : GET
 */
 export const getCategoryByIdController = async(_req: CategoriesRequest, res: Response) => {
  const category: Category = res.locals.category;
  return res.json({msg:'Get category by id successfully', category});
}


/**
 * @controller /api/categories/:id/products : GET
 */
 export const getCategoriesProductsController = async(_req: CategoriesRequest, res: Response) => {
  const category: Category = res.locals.category;

  try {
    const products = await category.getProducts();
    
    res.json({msg: 'Category products get successfully', products});
  } catch (error) {
    return catchError({error, type: errorTypes.get_category_products, res});
  }
}


/**
 * @controller /api/categories/ : POST
 */
export const createCategoryController = async(req: CategoriesRequest, res: Response) => {
  const categoryData = req.body;
  const authUser: User = res.locals.authUser;

  categoryData.user = authUser.id!;
  const category = new Category(categoryData);

  try {
    await category.save(); //primero esta para setear el id, desde aqui tambien se puede agregar al usuario
    // await authUser.addCategory(category); //-Lo normal seria solo usar este

    return res.json({msg: 'Category saved successfully', category});
  } catch (error) {
    return catchError({error, type: errorTypes.save_category, res});
  }
}


/**
 * @controller /api/categories/:id : PUT
 */
export const updateCategoryController = async(req: CategoriesRequest, res: Response) => {
  const { id } = req.params;
  const { user, ...categoryData } = req.body;

  const authUser: User = res.locals.authUser;
  const category: Category = res.locals.category;

  try {
    await category.update(categoryData);
    // const userCategory = await authUser.updateCategory(id, categoryData);

    return res.json({msg: 'Category updated successfully', category});
  } catch (error) {
    return catchError({error, type: errorTypes.update_category, res});
  }
}


/**
 * @controller /api/categories/:id : DELETE
 */
export const deleteCategoryController = async(req: CategoriesRequest, res: Response) => {
  const { id } = req.params;
  
  const authUser: User = res.locals.authUser;
  const category: Category = res.locals.category;

  try {
    await category.update({state: false});
    // await category.destroy();

    return res.json({msg: 'Category deleted successfully', category});
  } catch (error) {
    return catchError({error, type: errorTypes.delete_category, res});
  }
}