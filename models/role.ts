import { 
  CollectionReference, 
  DocumentData, 
  DocumentReference,
  DocumentSnapshot,
  FirestoreDataConverter,
  Query,
  QueryDocumentSnapshot,
  QuerySnapshot
} from 'firebase-admin/firestore';

import { db } from '../database/firebase';

export const roleConverter : FirestoreDataConverter<Role>  = {
  toFirestore(role: Role): DocumentData {
    return {
      name: role.name, 
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Role {
    const data = snapshot.data();
    return new Role({
      id: snapshot.id,
      name: data.name, 
    });
  }
};

interface RoleProperties {
  id  ?: string,
  name : string,
}

class Role {
  public id ?: string;
  public name : string;

  public static rolesRef: CollectionReference<Role> = db.collection('roles').withConverter(roleConverter);
  private readonly rolesRef: CollectionReference<Role>;

  constructor({id, name} : RoleProperties){
    this.id = id
    this.name = name;

    this.rolesRef = db.collection('roles').withConverter(roleConverter);
  }

  copyWith(role: Partial<Role>) {
    return new Role({
      id: role.id ?? this.id,
      name: role.name ?? this.name
    })
  }

  presave(){
    const trim = this.name.split(' ').filter(i => i).join(' ');
    this.name  = trim.toUpperCase();
  }

  async save(){
    this.presave();

    const doc = await Role.rolesRef.add(this);
    this.id = doc.id;
  }

  public static async findById(id: string) : Promise<Role | undefined> {
    const ref: DocumentReference<Role> = Role.rolesRef.doc(id);
    const doc: DocumentSnapshot<Role> = await ref.get();

    return doc?.data()?.copyWith({id: doc.id});
  }
  
  public static async findOne(data: Partial<RoleProperties>): Promise<Role | undefined> {
    // let filter: Query<Role> = Role.rolesRef.where("state","==", true);
    let filter: CollectionReference<Role> | Query<Role> =  db.collection('roles').withConverter(roleConverter);

    for(const [key, value] of Object.entries(data)){
      filter = filter.where(key,"==", value);
    }

    const snapshot: QuerySnapshot<Role> = await filter.get();
    const doc = snapshot?.docs[0];
    return doc?.data();
  }

  toJSON(){
    return {
      name: this.name
    }
  }
}

export default Role;