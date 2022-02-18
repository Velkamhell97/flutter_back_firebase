import { 
  CollectionReference, 
  DocumentData, 
  DocumentReference,
  DocumentSnapshot,
  FirestoreDataConverter,
  Query,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore';

import { db } from '../database/firebase';
import { FSQuery, Product } from './';
import { productConverter } from './product';
import User from './user';

export const categoryConverter : FirestoreDataConverter<Category>  = {
  toFirestore(category: Category): DocumentData {
    return {
      id    : category.id, 
      name  : category.name,
      lower : category.lower,
      user  : category.user,
      state : category.state
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Category {
    const data = snapshot.data();
    return new Category({
      id       : data.id, 
      name     : data.name, 
      lower    : data.lower,
      user     : data.user,
      state    : data.state,
      category : snapshot.ref
    });
  }
};

export interface CategoryProps {
  id       ?: string,
  name      : string,
  lower    ?: string,
  user      : string,
  state    ?: boolean,
  category ?: DocumentReference<DocumentData>
}

interface QueryOptions {
  limit : number,
  skip  : number,
}

class Category {
  public id         : string;
  public name       : string;
  public lower     ?: string;
  public user       : string;
  public state     ?: boolean;
  private category ?: DocumentReference<DocumentData>;

  public static categoryRef: CollectionReference<Category>;
  private usersRef: DocumentReference<Category>;
  private productsRef: CollectionReference<Product>;
  
  constructor({id, name, lower, user, state,  category} : CategoryProps){
    const refId = Category.categoryRef.doc().id;

    this.id       = id ?? refId;
    this.name     = name;
    this.lower    = lower ?? name;
    this.user     = user
    this.state    = state ?? true;
    this.category = category
    this.usersRef = User.usersRef.doc(this.user).collection('categories').doc(this.id).withConverter(categoryConverter);
    this.productsRef = this.usersRef.collection('products').withConverter(productConverter);
  }

  public static sync(collection:string){
    this.categoryRef = db.collection(collection).withConverter(categoryConverter)
  }

  copyWith(category: Partial<Category>) {
    return new Category({
      id    : category.id    ?? this.id,
      name  : category.name  ?? this.name,
      lower : category.lower ?? this.lower,
      user  : category.user  ?? this.user,
      state : category.state ?? this.state,
    })
  }

  presave(){
    const trim = this.name.split(' ').filter(i => i).join(' ');
    this.name  = trim.charAt(0).toUpperCase() + trim.substring(1).toLowerCase();

    // this.lower = this.name.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, ""); --> Quitar acentos
    this.lower = this.name.toLowerCase();
  }

  //---------------------------------Instance Methods------------------------------//
  async save(): Promise<void>{
    this.presave(); 
    await Category.categoryRef.doc(this.id).set(this);

    //-Para agregar tambien en el usuario
    await this.usersRef.set(this);
  }

  async update(data: Partial<CategoryProps>): Promise<void>{
    for(const [key, value] of Object.entries(data)){
      (<any>this)[key] = value
    }
    
    this.presave();
    await this.category!.update(this.toJSON());

    //-Para actualizar tambien en el usuario
    await this.usersRef.update(this.toJSON());
  }

  async destroy(): Promise<void>{
    await this.category!.delete();
    
    //-Para actualizar tambien en el usuario
    // await this.usersRef.delete();
  }

  //Obtener los productos de una categoria
  async getProducts(): Promise<Product[]> {
    const docs = (await this.productsRef.get()).docs;
    return docs?.map(doc => doc.data()) ?? []
  }
  
  //---------------------------------Class Finding Methods------------------------------//
  public static async findById(id: string) : Promise<Category | undefined> {
    const ref: DocumentReference<Category> = Category.categoryRef.doc(id);
    const doc: DocumentSnapshot<Category>  = await ref.get();
    
    return doc.data();
  }

  public static async findByIdAndUpdate(id: string, data: Partial<CategoryProps>) : Promise<Category>{
    await Category.categoryRef.doc(id).update(data);
    const doc = await Category.categoryRef.doc(id).get();
    
    return doc.data()!.copyWith(data);
  }

  public static async findByIdAndDestroy(id: string) : Promise<void>{
    await Category.categoryRef.doc(id).delete();
  }

  public static async findAll(options ?: QueryOptions) : Promise<Category[]> {
    let filter: Query<Category> = this.categoryRef;

    if(options?.limit){
      filter = filter.limit(options.limit);
    }
    if(options?.skip){
      filter = filter.offset(options.skip);
    }

    return (await filter.get()).docs.map(doc => doc.data());
  };


  //---------------------------------Class Query Methods------------------------------//
  public static async whereEqualOne(data: Partial<Category>): Promise<Category | undefined> {
    const filter = new FSQuery<Category>(this.categoryRef);
    const query = filter.whereEqual(data);

    const results = await query.getResults();
    return results ? results[0] : undefined;
  }

  public static whereEqual(data: Partial<Category>, options?: QueryOptions): FSQuery<Category> {
    const filter = new FSQuery<Category>(this.categoryRef);
    return filter.whereEqual(data, options);
  }

  public static whereStartsWith(data: Partial<Category>, options?: QueryOptions): FSQuery<Category> {
    const filter = new FSQuery<Category>(this.categoryRef);
    return filter.whereStartsWith(data, options);
  }

  public static async whereEitherContains(data: Partial<Category>, options?: QueryOptions): Promise<Category[]> {
    const filter = new FSQuery<Category>(this.categoryRef);
    return filter.queryWhereEitherContains(data, options);
  }

  toJSON(){
    const { category, usersRef, productsRef, ...rest } = this;
    return rest;
  }
}

export default Category;