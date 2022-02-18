import { Request, Response } from "express";
import { isValidObjectId, Document } from "mongoose";

import { catchError, errorTypes } from "../errors";
import { Category, Product, User } from "../models";

type QueryResults = User[] | Category[] | Product[];

/**
 * @controller /api/search/:collection/:query : GET
 */
export const searchController = async (req: Request, res: Response) => {
  const { collection, query } = req.params;

  let searchObject = {}; //->objeto de busqueda
  
  let results : QueryResults = []; //->para el tipado

  
  if(query.length == 20){
    searchObject = {id: query}; //->Busqueda por id
  } else {
    const prefix = query.toLowerCase(); //->Match en cualquier parte

    switch(collection.toLowerCase()) {
      case 'users':
        searchObject = {lower: prefix, email: prefix};
        break;
      case 'categories':
        searchObject = {lower: prefix};
        break;
      case 'products':
        searchObject = {lower: prefix, description: prefix};
        break;
    }
  }

  try {
    switch(collection.toLowerCase()) {
      case 'users':
        results = await User.whereEitherContains(searchObject);
        break;
      case 'categories':
        results = await Category.whereEitherContains(searchObject);
        break;
      case 'products':
        results = await Product.whereEitherContains(searchObject);
        break;
    }

    return res.json({msg:'search successfully', results});
  } catch (error) {
    return catchError({error, type: errorTypes.search_documents, res});
  }
}