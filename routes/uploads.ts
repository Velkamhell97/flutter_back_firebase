/**
 * @path /api/uploads
 */
import { Router } from "express";
import multer, { diskStorage } from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 } from 'uuid';

//-Routes Middlewares
import { 
  getProductImgMiddlewares, 
  getUserAvatarMiddlewares,
  uploadFilesMiddlewares,
} from "../middlewares/uploads";

//-Routes Controllers
import { 
  getProductImgController, 
  getUserAvatarController, 
  uploadFilesCloudinaryController,
  uploadFilesLocalController,

} from "../controller/uploads";

const storage = diskStorage({
  destination: function(_req, _res, cb) {
    //->Para un path por ruta se podria usar el req.url (con switch)
    const uploadPath = path.join(__dirname, `../../uploads/others`);
    
    if(!fs.existsSync(uploadPath)){
      fs.mkdirSync(uploadPath);
    }
    
    cb(null, uploadPath);
  },
  filename: function(_req, file, cb){
    //->Para un nombre por ruta se podria usar el req.url (con switch)
    const extension = file.originalname.split('.').at(-1);
    const tempName = v4() + "." + extension;

    cb(null, tempName);
  }
});

const upload = multer({storage: storage});

const router = Router();

router.post('/local',
  //->manejador de errores de multer
  // (_req: Request, res: Response, next: NextFunction) => upload(_req, res, onUploadError(res, next)),
  upload.any(),
  uploadFilesMiddlewares,
  uploadFilesLocalController
)

router.post('/cloud',
  upload.any(), 
  uploadFilesMiddlewares,
  uploadFilesCloudinaryController
)

router.get('/users/:id',
  getUserAvatarMiddlewares,
  getUserAvatarController
)

router.get('/products/:id',
  getProductImgMiddlewares,
  getProductImgController,
)

export default router;