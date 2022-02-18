import { checkSchema } from "express-validator/src/middlewares/schema";

//->Los schemas solo validan campos del body que no necesiten consultas en la db

/**
 * @schema create products validation schema
 */
 export const createProductBody = checkSchema({
  name: {
    notEmpty : {
      errorMessage: 'The name is required'
    }
  },

  price: {
    notEmpty : {
      errorMessage: 'The price is required',
      bail: true
    },
    isNumeric : {
      errorMessage: 'The price must be a number'
    },
  },

  category: {
    notEmpty: {
      errorMessage: 'The category is required',
    },
  }
});

/**
 * @schema update products validation schema
 */
 export const updateProductBody = checkSchema({
  id: {
    notEmpty: {
      errorMessage: 'invalid ID'
    }
  },

  price: {
    optional: {
      options: {nullable: true},
    },
    isNumeric : {
      errorMessage: 'The price must be a number'
    },
  },
});

/**
 * @schema update products validation schema
 */
 export const deleteProductBody = checkSchema({
  id: {
    notEmpty: {
      errorMessage: 'invalid ID'
    }
  },
});