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
import { FSQuery, Category, Product } from './';
import { categoryConverter, CategoryProps } from './category';
import { productConverter, ProductProps } from './product';

const userConverter : FirestoreDataConverter<User>  = {
  toFirestore(user: User): DocumentData {
    return {
      id     : user.id, 
      name   : user.name, 
      lower  : user.lower,
      email  : user.email, 
      avatar : user.avatar,
      role   : user.role,
      online : user.online,
      google : user.google,
      state  : user.state
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): User {
    const data = snapshot.data();
    return new User({
      id     : data.id, 
      name   : data.name, 
      lower  : data.lower,
      email  : data.email, 
      avatar : data.avatar,
      role   : data.role,
      online : data.online,
      google : data.google,
      state  : data.state,
      user   : snapshot.ref
    });
  }
};

interface UserProps {
  id       ?: string,
  name      : string,
  lower    ?: string,
  email     : string,
  avatar   ?: string,
  online   ?: boolean,
  role      : string,
  google   ?: boolean,
  state    ?: boolean,
  user     ?: DocumentReference<DocumentData>,
}

interface QueryOptions {
  limit : number,
  skip  : number,
}

class User {
  public id        : string;
  public name      : string;
  public lower    ?: string;
  public email     : string;
  public avatar   ?: string;
  public role      : string;
  public online   ?: boolean;
  public google   ?: boolean;
  public state    ?: boolean;
  private user    ?: DocumentReference<DocumentData>;

  public static usersRef: CollectionReference<User>;
  private categoriesRef: CollectionReference<Category>;
  
  constructor({id, name, lower, email, avatar, role, online, google, state, user} : UserProps){
    const refId = User.usersRef.doc().id;

    this.id     = id ?? refId;
    this.name   = name;
    this.lower  = lower ?? name; //-Podemos inicializar con el name y antes de grabarla castearla
    this.email  = email;
    this.avatar = avatar ?? '';
    this.role   = role;
    this.online = online ?? false;
    this.google = google ?? false;
    this.state  = state  ?? true;
    this.user   = user;

    this.categoriesRef = Category.categoryRef;
  }

  public static sync(collection:string){
    this.usersRef = db.collection(collection).withConverter(userConverter)
  }

  copyWith(user: Partial<User>) {
    return new User({
      id     : user.id     ?? this.id,
      name   : user.name   ?? this.name,
      lower  : user.lower  ?? this.lower,
      email  : user.email  ?? this.email,
      avatar : user.avatar ?? this.avatar,
      role   : user.role   ?? this.role,
      online : user.online ?? this.online,
      google : user.google ?? this.google,
      state : user.state   ?? this.state
    })
  }

  presave(){
    const trim = this.name.split(' ').filter(i => i).join(' ');
    
    this.name  = trim.replace(/(^\w|\s\w)(\S*)/g, (_,m1,m2) => m1.toUpperCase()+m2.toLowerCase());
    this.lower = this.name.toLowerCase();
  }

  //---------------------------------Instance Methods------------------------------//
  async save(): Promise<void>{
    this.presave(); 
    await User.usersRef.doc(this.id).set(this);
  }

  async update(data: Partial<UserProps>): Promise<void>{
    //-Estamos seguros que al actualizar siempre tendremos la referencia, porque primero traemos de firebase
    for(const [key, value] of Object.entries(data)){
      (<any>this)[key] = value
    }
    
    this.presave();
    await this.user!.update(this.toJSON());
  }

  async destroy(): Promise<void>{
    await this.user!.delete();
  }


  //---------------------------------Class Relations Methods------------------------------//
  async getCategories(): Promise<Category[]> {
    //-Ya estara disponible la referencia porque se consulta primero
    const snapshot = await this.user?.collection('categories').withConverter(categoryConverter).get();
    return snapshot?.docs?.map(doc => doc.data()) ?? []
  }
  
  async addCategory(category:Category){
    //category.presave() --> por si no se crea en otra coleccion
    await this.categoriesRef.doc(category.id).set(category);
    //return category --> para devolver la categoria actualizada
  }

  async updateCategory(categoryId: string, data: Partial<CategoryProps>){
    const ref = this.categoriesRef.doc(categoryId);
    
    const category = (await ref.get()).data()!;
    category.presave()

    await category.update({name:category.name, lower: category.lower, ...data});
    // return category; //-> para devolver la categoria actualizada
  }

  async deleteCategory(categoryId:string){
    const category = this.categoriesRef.doc(categoryId);
    await category.delete();
    // return (await category.get()).data() //-Para devolver categoria eliminada
  }

  async getProducts(categoryId:string): Promise<Product[]> {
    //-Ya estara disponible la referencia porque se consulta primero
    const snapshot = await this.user?.collection('categories').doc(categoryId).collection('products').withConverter(productConverter).get();
    return snapshot?.docs?.map(doc => doc.data()) ?? []
  }
  
  async addProduct(categoryId:string, product:Product){
    //product.presave() --> por si no se crea en otra coleccion
    await this.categoriesRef.doc(categoryId).collection('products').withConverter(productConverter).doc(product.id).set(product);
    //return product --> para devolver el producto actualizada
  }

  async updateProduct(categoryId: string, productId: string, data: Partial<ProductProps>){
    const ref = this.categoriesRef.doc(categoryId).collection('products').withConverter(productConverter).doc(productId);
    
    const product = (await ref.get()).data()!;
    product.presave()

    await product.update({name:product.name, lower: product.lower, ...data});
    // return product; //-> para devolver el producto actualizada
  }

  async deleteProduct(categoryId:string, productId: string){
    const product = this.categoriesRef.doc(categoryId).collection('products').withConverter(productConverter).doc(productId);
    await product.delete();
    // return (await product.get()).data() //-Para devolver el producto eliminada
  }

  //---------------------------------Class Finding Methods------------------------------//
  public static async findById(id: string) : Promise<User | undefined> {
    const ref: DocumentReference<User> = this.usersRef.doc(id);
    const doc: DocumentSnapshot<User>  = await ref.get();
    
    return doc.data();
  }

  public static async findByIdAndUpdate(id: string, data: Partial<UserProps>) : Promise<User>{
    await this.usersRef.doc(id).update(data);
    const doc = await this.usersRef.doc(id).get();
    
    return doc.data()!.copyWith(data);
  }

  public static async findByIdAndDestroy(id: string) : Promise<void>{
    await this.usersRef.doc(id).delete();
  }

  public static async findAll(options ?: QueryOptions) : Promise<User[]> {
    let filter: Query<User> = this.usersRef;

    if(options?.limit){
      filter = filter.limit(options.limit);
    }
    if(options?.skip){
      filter = filter.offset(options.skip);
    }

    return (await filter.get()).docs.map(doc => doc.data());
  };


  //---------------------------------Class Query Methods------------------------------//
  public static async whereEqualOne(data: Partial<User>): Promise<User | undefined> {
    const filter = new FSQuery<User>(this.usersRef);
    const query = filter.whereEqual(data);

    const results = await query.getResults();
    return results ? results[0] : undefined;
  }

  public static whereEqual(data: Partial<User>, options?: QueryOptions): FSQuery<User> {
    const filter = new FSQuery<User>(this.usersRef);
    return filter.whereEqual(data, options);
  }

  public static whereStartsWith(data: Partial<User>, options?: QueryOptions): FSQuery<User> {
    const filter = new FSQuery<User>(this.usersRef);
    return filter.whereStartsWith(data, options);
  }

  public static async whereEitherContains(data: Partial<User>, options?: QueryOptions): Promise<User[]> {
    const filter = new FSQuery<User>(this.usersRef);
    return filter.queryWhereEitherContains(data, options);
  }
  
  toJSON(){
    const { user, categoriesRef, ...rest } = this;
    return rest;
  }
}

export default User;