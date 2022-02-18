import { Response } from "express";

import { catchError, errorTypes } from "../errors";
import { ProductsRequest } from "../interfaces/products";
import { Product, User } from "../models";
import cloudinary from "../models/cloudinary";


/**
 * @controller /api/categories/ : GET
 */
export const getProductsController = async(_req: ProductsRequest, res: Response) => {
  try {
    const products = await Product.whereEqual({state:true}).getResults();

    return res.json({msg:'Get all products successfully', products});
  } catch (error) {
    return catchError({error, type: errorTypes.get_products, res});
  }
}


/**
 * @controller /api/categories/search?name=:name : GET
 */
 export const getProductsByNameController = async(req: ProductsRequest, res: Response) => {
  const { name } = req.query;

  const lower = name?.toString().toLowerCase();

  try {
    const products = await Product.whereStartsWith({lower}).getResults(); //--> Prefix Match (starts with)

    return res.json({msg:'Get products by name successfully', products});
  } catch (error) {
    return catchError({error, type: errorTypes.get_products_by_name, res});
  }
}


/**
 * @controller /api/categories/:id : GET
 */
 export const getProductByIdController = async(_req: ProductsRequest, res: Response) => {
  const product: Product = res.locals.product;
  return res.json({msg:'Get product by id successfully', product});
}


/**
 * @controller /api/categories/ : POST
 */
export const createProductController = async(req: ProductsRequest, res: Response) => {
  const productData = req.body;
  const authUser: User = res.locals.authUser;

  productData.user = authUser.id!;
  const img: Express.Multer.File | undefined = res.locals.file;
  
  const product = new Product(productData); //-Aqui ya tenemos el id
  
  if(img){
    try {
      const response = await cloudinary.uploadImage({path: img.path, filename: product.id, folder: 'products'})
      product.img = response.secure_url;
    } catch (error) { 
      return catchError({error, type: errorTypes.upload_cloudinary, res});
    }
  }

  try {
    await product.save(); //primero esta para setear el id
    // await authUser.addProduct(product.category, product); //-Utilizamos en objeto user de los locals
  
    return res.json({msg: 'Product saved successfully', product});
  } catch (error) {
    return catchError({error, type: errorTypes.save_product, res});
  }
}


/**
 * @controller /api/categories/:id : PUT
 */
export const updateProductController = async(req: ProductsRequest, res: Response) => {
  const { id } = req.params;
  const { user, ...productData } = req.body;

  const authUser: User = res.locals.authUser;
  const product: Product = res.locals.product;

  const img: Express.Multer.File | undefined = res.locals.file; 

  if(img){
    try {
      const response = await cloudinary.uploadImage({path: img.path, filename: id, folder: 'products'});
      productData.img = response.secure_url;
    } catch (error) { 
      return catchError({error, type: errorTypes.upload_cloudinary, res});
    }
  }

  try {
    await product.update(productData);
    // const userProduct = await authUser.updateProduct(product.category, product.id, productData);

    return res.json({msg: 'Product updated successfully', product});
  } catch (error) {
    return catchError({error, type: errorTypes.update_category, res});
  }
}


/**
 * @controller /api/categories/:id : DELETE
 */
export const deleteProductController = async(req: ProductsRequest, res: Response) => {
  const { id } = req.params;
  
  const authUser: User = res.locals.authUser;
  const product: Product = res.locals.product;

  try {
    await product.update({state: false});

    return res.json({msg: 'Product deleted successfully', product});
  } catch (error) {
    return catchError({error, type: errorTypes.delete_category, res});
  }
}