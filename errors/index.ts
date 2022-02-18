import { Response } from 'express';

export interface AppError {
  code : number,
  name ?: string
  msg ?: string,

  [futureKey:string] : any
}
export interface ErrorParams {
  type : AppError,
  error ?: any,
  res : Response,
  [futureKey:string] : any
}

//->El error viene de los try y cath de afuera al igual que el rest o extras
export const catchError = ({type, error, res, ...rest} : ErrorParams) => {
  if(error){
    console.log(error);
  }

  return res.status(type.code).json({error, details:type, rest})
}

type ErrorTypes = 
| "get_users" //-> Users Errors  
| "get_user_by_id"
| "get_user_categories"
| "save_user"
| "update_user"
| "delete_user"
| "user_not_found"
| "duplicate_email"
| "role_not_found"

| "get_categories" //-> Categories Errors  
| "get_categories_by_name"
| "get_category_by_id"
| "get_category_products"
| "save_category"
| "update_category"
| "delete_category"
| "category_not_found"
| "category_unauthorized"
| "duplicate_category"

| "get_products" //-> Products Errors  
| "get_products_by_name"
| "get_product_by_id"
| "save_product"
| "update_product"
| "delete_product"
| "product_not_found"
| "product_unauthorized"
| "duplicate_product"

| "search_documents" //-> Others Errors
| "login"
| "generate_jwt"
| "upload_cloudinary"
| "upload_local_files"
| "google_signin"
| "user_blocked"
| "no_token"
| "invalid_token"
| "auth_user_not_found"
| "invalid_file_extension"
| "permissions"
| "collection_not_found"
| "no_files_upload"
| "missing_files"
| "move_local_files"

export const errorTypes: Record<ErrorTypes, AppError> ={
  //------------------------------User Errors -----------------------------//
  get_users: {
    msg: 'There was an error while getting the users',
    name: 'DATABASE_ERROR',
    code: 500,
  },

  get_user_by_id: {
    msg: 'There was an error while getting the user',
    name: 'DATABASE_ERROR',
    code: 500,
  },

  get_user_categories: {
    msg: 'There was an error while getting the user categories',
    name: 'DATABASE_ERROR',
    code: 500,
  },

  save_user: {
    msg: 'There was an error while saving the user',
    name: 'DATABASE_ERROR',
    code: 500,
  },

  update_user: { 
    msg: 'There was an error while updating the user',
    name: 'DATABASE_ERROR',
    code: 500, 
  },

  delete_user: { 
    msg: 'There was an error while deleting the user',
    name: 'DATABASE_ERROR',
    code: 500, 
  },

  user_not_found: { 
    msg: 'The user does not exist in the database or was deleted',
    name: 'USER_NOT_FOUND_ERROR',
    code: 400, 
  },

  duplicate_email: {
    msg: 'This email is already in use',
    name: 'DUPLICATE_EMAIL_ERROR',
    code: 400,
  },

  role_not_found: { 
    msg: 'The role does not exist in the database or was deleted',
    name: 'ROLE_NOT_FOUND_ERROR',
    code: 400, 
  },

  //------------------------------Category Errors-----------------------------//
  get_categories: {
    msg: 'There was an error while getting the categories',
    name: 'DATABASE_ERROR',
    code: 500,
  },

  get_categories_by_name: {
    msg: 'There was an error while getting the categories',
    name: 'DATABASE_ERROR',
    code: 500,
  },

  get_category_by_id: {
    msg: 'There was an error while getting the category',
    name: 'DATABASE_ERROR',
    code: 500,
  },

  get_category_products: {
    msg: 'There was an error while getting the category products',
    name: 'DATABASE_ERROR',
    code: 500,
  },

  save_category: {
    msg: 'There was an error while saving the category',
    name: 'DATABASE_ERROR',
    code: 500,
  },

  update_category: { 
    msg: 'There was an error while updating the category',
    name: 'DATABASE_ERROR',
    code: 500, 
  },

  delete_category: { 
    msg: 'There was an error while deleting the category',
    name: 'DATABASE_ERROR',
    code: 500, 
  },

  category_not_found: { 
    msg: 'The category does not exist in the database or was deleted',
    name: 'CATEGORY_NOT_FOUND_ERROR',
    code: 400, 
  },

  category_unauthorized: { 
    msg: 'Only the author of the category can update or delete',
    name: 'CATEGORY_UNAUTHORIZED',
    code: 401, 
  },

  duplicate_category: {
    msg: 'This category already exist in the database',
    name: 'DUPLICATE_CATEGORY_ERROR',
    code: 400,
  },

  //------------------------------Products Errors -----------------------------//
  get_products: {
    msg: 'There was an error while getting the products',
    name: 'DATABASE_ERROR',
    code: 500,
  },

  get_products_by_name: {
    msg: 'There was an error while getting the products',
    name: 'DATABASE_ERROR',
    code: 500,
  },

  get_product_by_id: {
    msg: 'There was an error while getting the product',
    name: 'DATABASE_ERROR',
    code: 500,
  },

  save_product: {
    msg: 'There was an error while saving the product',
    name: 'DATABASE_ERROR',
    code: 500,
  },

  update_product: { 
    msg: 'There was an error while updating the product',
    name: 'DATABASE_ERROR',
    code: 500, 
  },

  delete_product: { 
    msg: 'There was an error while deleting the product',
    name: 'DATABASE_ERROR',
    code: 500, 
  },

  product_not_found: { 
    msg: 'The product does not exist in the database or was deleted',
    name: 'PRODUCT_NOT_FOUND_ERROR',
    code: 400, 
  },

  product_unauthorized: { 
    msg: 'Only the author of the product can update or delete',
    name: 'PRODUCT_UNAUTHORIZED',
    code: 401, 
  },

  duplicate_product: {
    msg: 'This product already exist in the database',
    name: 'DUPLICATE_PRODUCT_ERROR',
    code: 400,
  },

  //------------------------------Others Errors-----------------------------//
  search_documents: { 
    msg: 'There was an error while searching the documents',
    name: 'DATABASE_ERROR',
    code: 500, 
  },

  login: { 
    msg: 'The email or password is incorrect',
    name: 'LOGIN_ERROR',
    code: 400, 
  },

  generate_jwt: { 
    msg: 'There was an error while generating the JWT',
    name: 'JWT_GENERATOR_ERROR',
    code: 500, 
  },

  upload_cloudinary: { 
    msg: 'There was an error while updating the file to cloudinary',
    name: 'CLOUDINARY_SERVICE_ERROR',
    code: 500, 
  },

  upload_local_files: { 
    msg: 'There was an error while updating the file to dest path',
    name: 'UPLOAD_LOCAL_FILES_ERROR',
    code: 500, 
  },

  google_signin: { 
    msg: 'There was an error while sign in with google',
    name: 'GOOGLE_SIGN_IN_SERVICE_ERROR',
    code: 500, 
  },

  user_blocked: { 
    msg: 'This user was blocked, please contact with support',
    name: 'USER_BLOCKED_ERROR',
    code: 401, 
  },

  no_token: {
    msg: 'There is not token in request',
    name: 'NO_TOKEN_ERROR',
    code: 401, 
  },

  invalid_token: {
    msg: 'Token expired or unsigned',
    name: 'INVALID_TOKEN_ERROR',
    code: 401, 
  },

  auth_user_not_found: {
    msg: 'Auth user not found in database, please contact with support',
    name: 'AUTH_USER_NOT_FOUND_ERROR',
    code: 401, 
  },

  invalid_file_extension: {
    msg: 'The file uploaded has an invalid extension',
    name: 'FILE_INVALID_EXTENSION_ERROR',
    code: 400, 
  },

  permissions: {
    msg: 'The current user dont have the permissions for this operation',
    name: 'PERMISSIONS_ERROR',
    code: 401, 
  },

  collection_not_found: { 
    msg: 'The collection is not available',
    name: 'COLLECTION_NOT_FOUND_ERROR',
    code: 400, 
  },

  no_files_upload: { 
    msg: 'No files were uploaded',
    name: 'NO_FILES_UPLOAD_ERROR',
    code: 400, 
  },

  missing_files: { 
    msg: 'There are some missing or extra files that are expected',
    name: 'MISSING_OR_EXTRA_FILES_ERROR',
    code: 400, 
  },

  move_local_files: { 
    msg: 'There was an error while moving the uploaded files to local path',
    name: 'MOVE_LOCAL_FILES_ERROR',
    code: 500, 
  },
} 
