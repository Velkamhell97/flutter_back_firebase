import { initializeApp } from 'firebase-admin/app';
import { credential, ServiceAccount } from 'firebase-admin';

import serviceAccount from './flutter-apps-3e186-firebase-adminsdk-rul56-2b69e0fa3e.json';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// const serviceAccount = require('./flutter-apps-3e186-firebase-adminsdk-rul56-fd890fafef.json');

//-Se puede inicializar de esta manera y acceder a los demas servicios mediante el get o exportar los
//-archivos secuencialmente como se muestra en la parte de abajo para tener una referencia global de estos
const initFirebase = () => {
  // try {
  //   initializeApp({
  //     credential: credential.cert(serviceAccount as ServiceAccount),
  //   });

  //   console.log('firebase init');
  // } catch (error) {
  //   console.log('firebase init fail');
    
  //   throw error
  // }
}

//-Al parecer este archivo se ejecuta unicamente la primera vez que se llama y en orden, es decir al exportar el
//-db y auth ya se inicializo el app
console.log('entre al archivo')

export const app = initializeApp({
  credential: credential.cert(serviceAccount as ServiceAccount),
  storageBucket: 'gs://flutter-apps-3e186.appspot.com'
});

export const db = getFirestore(app);
export const auth = getAuth(app);
export const bucket = getStorage(app).bucket();

//-Parece que en este archivo se ejecuta primero que el de app por alguna razon
export default initFirebase;

