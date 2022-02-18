import { checkSchema } from "express-validator/src/middlewares/schema";

//->Los schemas solo validan campos del body que no necesiten consultas en la db

/**
 * @schema create user validation schema
 */
 export const createUserBody = checkSchema({
  name: {
    notEmpty : {
      errorMessage: 'The name is required'
    }
  },

  email: {
    isEmail : {
      errorMessage: 'Invalid email',
    },
  },

  password: {
    isLength : {
      errorMessage: 'The password must have at least 7 characters',
      options: {min: 6}
    }
  },

  role: {
    notEmpty: {
      errorMessage: 'The Role is required',
    },
  }
});

/**
 * @schema update user validation schema
 */
export const updateUserBody = checkSchema({
  id: {
    notEmpty: {
      errorMessage: 'Invalid ID',
    },
  },

  email: {
    optional: {
      options: {nullable: true},
    }, 
    isEmail : {
      errorMessage: 'Invalid email',
    },
  },

  password: {
    optional: {
      options: {nullable: true}
    },
    isLength : {
      errorMessage: 'The password must have at least 7 characters',
      options: {min: 6},
    }
  },
});

/**
 * @schema delete user validation schema
 */
 export const deleteUserBody = checkSchema({
  id: {
    notEmpty: {
      errorMessage: 'Invalid ID',
    },
  },
});