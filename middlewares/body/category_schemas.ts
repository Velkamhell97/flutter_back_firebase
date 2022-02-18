import { checkSchema } from "express-validator";

//->Los schemas solo validan campos del body que no necesiten consultas en la db

/**
 * @schema create category validation schema
 */
 export const createCategoryBody = checkSchema({
  name: {
    notEmpty : {
      errorMessage: 'The name is required'
    }
  },
});

/**
 * @schema update category validation schema
 */
export const updateCategoryBody = checkSchema({
  id: {
    notEmpty: {
      errorMessage: 'Invalid ID',
    },
  },
});

/**
 * @schema delete category validation schema
 */
export const deleteCategoryBody = checkSchema({
  id: {
    notEmpty: {
      errorMessage: 'Invalid ID',
    },
  },
});