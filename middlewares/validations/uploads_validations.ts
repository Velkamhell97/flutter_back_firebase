import { Request, Response, NextFunction } from "express";

import { catchError, errorTypes } from "../../errors";

/**
 * @middleware validate user avatar (create and update valid)
 */
 export const validateMultipleFiles = (fields: string[], extensions: string[]) => async(req: Request, res: Response, next: NextFunction) => {
  const files = req.files as Express.Multer.File[] | undefined; 

  //->Si no vienen files o esta vacio ya es un error
  if(!files || !files.length){
    return catchError({
      type: errorTypes.no_files_upload,
      res
    })
  } 

  //->Valida que todos los fields vengan 
  const fileNames = files.map(f => f.fieldname);
  const containFiles = fields.every(file => fileNames.includes(file))

  const paths = files.map(f => f.path);
  
  //->Si no vienen todos los campos o si vienen mas de los requeridos 
  if (!containFiles || files.length > fields.length) {
    // deleteFilesLocal(paths);

    return catchError({
      type: errorTypes.missing_files,
      extra: `The folowing files were expected: ${fields}, recibed: ${fileNames}`,
      res
    })
  }

  let extensionError = '';

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const ext = file.originalname.split('.').at(-1)!;

    if(!extensions.includes(ext)){
      extensionError = `The file \'${file.fieldname}\' have an invalid extension, valid extensions: ${extensions}`;
      break;
    }
  }
  
  if(extensionError){
    // deleteFilesLocal(paths);

    return catchError({
      type: errorTypes.invalid_file_extension,
      extra: extensionError,
      res
    });
  }
  
  next();
}