import { Request, Response } from "express";
import path from 'path';
import fs from 'fs';

import { catchError, errorTypes } from "../errors";
import { LocalUploadedFile } from "../interfaces/uploads";
import { uploadFileCloudinary } from "../helpers";
import { Product, User } from "../models";


/**
 * @controller /api/uploads/multer : POST
 */
 export const uploadFilesLocalController = async(req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];

  const uploadedFiles = files.map<LocalUploadedFile>(file => ({fieldname: file.fieldname, name: file.filename, path: file.path}));

  res.json({msg: 'Files uploaded successfully', uploadedFiles})
}


/**
 * @controller /api/uploads/cloud : POST
 */
 export const uploadFilesCloudinaryController = async(req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];

  try {
    const uploadedFiles = await Promise.all(
      files.map(file => uploadFileCloudinary(file.fieldname, file.path, 'others'))
    );

    //->Para subir archivos a cloudinary todos se almacenan primero en el temp y despues se borran (si se requiere)
    // deleteFilesLocal(files.map(f => f.path))
    
    res.json({msg: 'Files uploaded successfully', uploadedFiles});
  } catch (error:any) {
    return catchError({
      error: error.error,
      type: errorTypes.upload_cloudinary,
      extra: error.msg,
      res
    });
  }
}


/**
 * @controller /api/uploads/users/:id : GET
 * No funciona para cuando el archivo no es local, como por ejemplo una url
 */
export const getUserAvatarController = async(_req: Request, res: Response) => {

  const user: User = res.locals.user;

  //->Si esta el avatar y el archivo en el path referido muestra la imagen si no muestra un placeholder
  if(user!.avatar){
    const avatar = path.join(__dirname, '../../uploads/users', user.avatar);

    if(fs.existsSync(avatar)){
      return res.sendFile(avatar);
    }
  }

  const defaultImage = path.join(__dirname, '../../assets', 'no-image.jpg');
  return res.sendFile(defaultImage);
}


/**
 * @controller /api/uploads/products/:id : GET
 */
 export const getProductImgController = async(_req: Request, res: Response) => {
  const product: Product = res.locals.product;

  if(product!.img){
    const image = path.join(__dirname, '../../uploads/products', product.img);

    if(fs.existsSync(image)){
      return res.sendFile(image);
    }
  }

  const defaultImage = path.join(__dirname, '../../assets', 'no-image.jpg');
  return res.sendFile(defaultImage);
}
