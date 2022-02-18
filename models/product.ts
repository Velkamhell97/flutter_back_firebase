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
import { FSQuery, User } from './';

export const productConverter : FirestoreDataConverter<Product>  = {
  toFirestore(product: Product): DocumentData {
    return {
      id          : product.id,
      name        : product.name,
      lower       : product.lower,
      user        : product.user,
      price       : product.price,
      img         : product.img,
      category    : product.category,
      description : product.description,
      available   : product.available,
      state       : product.state
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Product {
    const data = snapshot.data();
    return new Product({
      id          : data.id,
      name        : data.name,
      lower       : data.lower,
      user        : data.user,
      price       : data.price,
      img         : data.img,
      category    : data.category,
      description : data.description,
      available   : data.available,
      state       : data.state,
      product: snapshot.ref
    });
  }
};

export interface ProductProps {
  id          ?: string, //-En las propiedades de constructor opcional, pero en la clase obligatorio
  name         : string,
  lower       ?: string,
  user         : string,
  price       ?: number,
  img         ?: string,
  category     : string,
  description ?: string,
  available   ?: boolean,
  state       ?: boolean,
  product     ?: DocumentReference<DocumentData>
}

interface QueryOptions {
  limit ?: number,
  skip  ?: number,
}

class Product {
  public id           : string;
  public name         : string;
  public lower       ?: string;
  public user         : string;
  public price       ?: number;
  public img         ?: string;
  public category     : string;
  public description ?: string;
  public available   ?: boolean;
  public state       ?: boolean;
  private product    ?: DocumentReference<DocumentData>;
  
  public static productsRef: CollectionReference<Product>;
  private usersRef: DocumentReference<Product>;
  
  constructor({id, name, lower, user, price, img, category, description, available, state,  product} : ProductProps){
    const refId = Product.productsRef.doc().id;
    
    this.id    = id ?? refId; //-Si queremos utilizar nuestro propio id o el generado por firebase
    this.name  = name;
    this.lower = lower ?? name;
    this.user  = user;
    this.price = price ?? 0.0;
    this.img   = img ?? '';
    this.category = category;
    this.description = description ?? 'No description';
    this.available = available ?? true;
    this.state = state ?? true;
    this.product = product;
    this.usersRef = User.usersRef.doc(this.user).collection('categories').doc(this.category).collection('products').doc(this.id).withConverter(productConverter);
  }

  public static sync(collection:string){
    this.productsRef = db.collection(collection).withConverter(productConverter)
  }

  copyWith(product: Partial<Product>) {
    return new Product({
      id          : product.id          ?? this.id,
      name        : product.name        ?? this.name,
      lower       : product.lower       ?? this.lower,
      user        : product.user        ?? this.user,
      price       : product.price       ?? this.price,
      img         : product.img         ?? this.img,
      category    : product.category    ?? this.category,
      description : product.description ?? this.description,
      available   : product.available   ?? this.available,
      state       : product.state       ?? this.state
    })
  }

  //---------------------------------Hooks Methods------------------------------//
  presave():void{
    const trim = this.name.split(' ').filter(i => i).join(' ');

    this.name  = trim.charAt(0).toUpperCase() + trim.substring(1).toLowerCase();
    this.lower = this.name.toLowerCase();
  }

  //---------------------------------Instance Methods------------------------------//
  async save(): Promise<void>{
    this.presave(); 
    await Product.productsRef.doc(this.id).set(this);

    //-Para agregar tambien en el usuario
    await this.usersRef.set(this);
  }

  async update(data: Partial<ProductProps>): Promise<void>{
    for(const [key, value] of Object.entries(data)){
      (<any>this)[key] = value
    }
    
    this.presave();
    await this.product!.update(this.toJSON());

    //-Para actualizar tambien en el usuario
    await this.usersRef.update(this.toJSON());
  }

  async destroy(): Promise<void>{
    await this.product!.delete();

    //-Para actualizar tambien en el usuario
    await this.usersRef.delete();
  }

  
  //---------------------------------Class Finding Methods------------------------------//
  public static async findById(id: string) : Promise<Product | undefined> {
    //-En los metodos estaticos se puede acceder a las variables estaticos con el this
    const ref: DocumentReference<Product> = this.productsRef.doc(id);
    const doc: DocumentSnapshot<Product>  = await ref.get();
    
    return doc.data();
  }

  public static async findByIdAndUpdate(id: string, data: Partial<ProductProps>) : Promise<Product>{
    await this.productsRef.doc(id).update(data);
    const doc = await this.productsRef.doc(id).get();
    
    return doc.data()!.copyWith(data);
  }

  public static async findByIdAndDestroy(id: string) : Promise<void>{
    await this.productsRef.doc(id).delete();
  }

  public static async findAll(options ?: QueryOptions) : Promise<Product[]> {
    let filter: Query<Product> = this.productsRef;

    if(options?.limit){
      filter = filter.limit(options.limit);
    }
    if(options?.skip){
      filter = filter.offset(options.skip);
    }

    return (await filter.get()).docs.map(doc => doc.data());
  };
  
  //---------------------------------Class Query Methods------------------------------//
  public static async whereEqualOne(data: Partial<Product>): Promise<Product | undefined> {
    const filter = new FSQuery<Product>(this.productsRef);
    const query = filter.whereEqual(data);

    const results = await query.getResults();
    return results ? results[0] : undefined;
  }

  public static whereEqual(data: Partial<Product>, options?: QueryOptions): FSQuery<Product> {
    const filter = new FSQuery<Product>(this.productsRef);
    return filter.whereEqual(data, options);
  }

  public static whereStartsWith(data: Partial<Product>, options?: QueryOptions): FSQuery<Product> {
    const filter = new FSQuery<Product>(this.productsRef);
    return filter.whereStartsWith(data, options);
  }

  public static async whereEitherContains(data: Partial<Product>, options?: QueryOptions): Promise<Product[]> {
    const filter = new FSQuery<Product>(this.productsRef);
    return filter.queryWhereEitherContains(data, options);
  }

  toJSON(){
    const { product, usersRef, ...rest } = this;
    return rest;
  }
}

export default Product;