import { googleBody, loginBody } from "./body/auth_schemas"
import { validateLogin } from "./validations/auth_validations"
import { validateBody, validateJWT } from "./validations/shared_validations"

export const renewTokenMiddlewares = [
  validateJWT
]

export const loginMiddlewares = [
  ...loginBody,
  validateBody,
  validateLogin
]

export const googleSignInMiddlewares = [
  ...googleBody,
  validateBody
]