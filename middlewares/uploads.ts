import { validateProductID } from "./validations/products_validations";
import { validateMultipleFiles } from "./validations/uploads_validations";
import { validateUserID } from "./validations/user_validations";

export const uploadFilesMiddlewares = [
  validateMultipleFiles(
    ['image','post'], 
    ['jpg','jpeg','png','gif'],
  )
]

export const getUserAvatarMiddlewares = [
  validateUserID,
]

export const getProductImgMiddlewares = [
  validateProductID,
]