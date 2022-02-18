import { Query } from "firebase-admin/firestore";

interface QueryOptions {
  limit ?: number,
  skip  ?: number,
}

type StringPropsNames<T> = NonNullable<{
  [K in keyof T]: T[K] extends string | undefined ? K : never;
}[keyof T]>;

type StringProps<T> = Pick<T, StringPropsNames<T>>

class FSQuery<T> {
 
  private filter: Query<T>;

  constructor(ref: Query<T>) {
    this.filter = ref;
  }

  //----------------------------------Queries Operations------------------------------------------//
  private queryWhereEqual(data: Partial<T>, options ?: QueryOptions): void {
    for(const [key, value] of Object.entries(data)){
      this.filter = this.filter.where(key,"==", value);
    }

    if(options?.limit){
      this.filter = this.filter.limit(options.limit);
    }
    if(options?.skip){
      this.filter = this.filter.offset(options.skip);
    }
  }

  public async queryWhereEitherContains(data: Partial<T>, options ?: QueryOptions): Promise<T[]> {
    let results: Array<T> = [];
    
    const docs = (await this.filter.get()).docs;
    const records = docs?.map(doc => doc.data()) ?? [];

    //{name, email}
    for(const [key, value] of Object.entries(data)){
      const matches = records.filter(record => (<any>record)[key].includes(value))
      results = [...results, ...matches];
    }

    //-Elimina los valores duplicados-
    return   [...new Set(results)].slice(options?.limit, options?.skip);
  }

  private queryStartsWith(data: Partial<StringProps<T>>, options ?: QueryOptions): void {
    for(const [key, value] of Object.entries(data)){
      const query = value as string;

      const strlength = query.length;
      const strFrontCode = query.slice(0, strlength - 1) ;
      const strEndCode = query.slice(strlength - 1, strlength);
      
      const startCode = query;
      const endCode = strFrontCode + String.fromCharCode(strEndCode.charCodeAt(0) + 1);

      this.filter = this.filter.where(key,">=", startCode).where(key, "<", endCode);
    }

    if(options?.limit){
      this.filter = this.filter.limit(options.limit);
    }
    if(options?.skip){
      this.filter = this.filter.offset(options.skip);
    }
  }

  //----------------------------------Queries Methods------------------------------------------//
  public whereEqual(data : Partial<T>, options ?: QueryOptions): FSQuery<T> {
    this.queryWhereEqual(data, options);
    return new FSQuery<T>(this.filter);
  }

  public whereStartsWith(data : Partial<T>, options ?: QueryOptions): FSQuery<T> {
    this.queryStartsWith(data, options);
    return new FSQuery<T>(this.filter);
  }

  public async getResults():Promise<T[]> {
    const snapshot = await this.filter.get();
    return snapshot?.docs?.map(doc => doc.data()) ?? [];
  }


}

export default FSQuery;