import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentData, QuerySnapshot} from '@angular/fire/firestore';

import * as firebase from 'firebase';


@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(
    private firestore: AngularFirestore
  ) { 
  }

  save(collection:string, document:string, data:any):Promise<void>{

    return this.firestore.collection(collection).doc(document).set(data);
   
  }
  getEqualsObs(collection:string, key:string, value:string):Observable<firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>>{
    return this.firestore.collection(collection, ref => ref.where(key, "==" , value)).get();    
  } 
  getEquals(collection:string, key:string, value:string):Promise<firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>>{
    return this.firestore.collection(collection, ref => ref.where(key, "==" , value)).get().toPromise();    
  }
  getEqualsDouble(collection:string, key1:string, value1:string, key2:string, value2:string):Promise<firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>>{
    return this.firestore.collection(collection, ref => ref.where(key1, "==" , value1).where(key2, "==", value2)).get().toPromise();    
  }
  get(collection:string, document:string):Promise<firebase.firestore.DocumentSnapshot>{

    return this.firestore.collection(collection).doc(document).get().toPromise();
   
  }
  
  getObs(collection:string, document:string):Observable<firebase.firestore.DocumentSnapshot>{

    return this.firestore.collection(collection).doc(document).get();
   
  }
  getValueChanges(collection:string, document:string):Observable<unknown>{

    return this.firestore.collection(collection).doc(document).valueChanges();
   
  }
  getRealtimeCollection(collection:string):Observable<unknown[]>{

    return this.firestore.collection(collection).valueChanges();
   
  }

  public getRealTimeCollectionWithQuery(collection:string, key1:string, value1:string, key2:string, value2:string, key3:string, value3:string, orderBy:string):Observable<unknown[]> {
    return this.firestore.collection(collection, ref =>
      ref.where(key1, "==", value1)
        .where(key2, "==", value2)
        .where(key3, "==", value3)
      .orderBy(orderBy))
      .valueChanges();
  }
  update(collection:string, document:string, data:any):Promise<void>{
    return this.firestore.collection(collection).doc(document).set(data, {merge:true});
  }
  delete(collection:string, document:string):Promise<void>{
    return this.firestore.collection(collection).doc(document).delete();
  }

  getAllStartAfter(collection:string, limit:number, document:DocumentData):Promise<QuerySnapshot<DocumentData>>{

    return this.firestore.collection(collection,ref => ref.startAfter(document).limit(limit))
    .get().toPromise();
   
  }
  getAll(collection:string, limit:number):Promise<QuerySnapshot<DocumentData>>{

    return this.firestore.collection(collection,ref => ref.limit(limit))
    .get().toPromise();
   
  }
}