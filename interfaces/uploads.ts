export interface CustomUploadedFile { //-> Utilizada para agregar propiedad a express-fileupload
  fieldname: string
}

export interface LocalUploadedFile {
  fieldname: string,
  path: string,
  name: string
}

export interface CloudinaryUploadedFile {
  fieldname: string,
  url: string
  name: string
}