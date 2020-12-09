import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentData, DocumentSnapshot } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(
    private firestore: AngularFirestore
  ) { }

  save(collection:string, document:string, data:any):Promise<void>{

    return this.firestore.collection(collection).doc(document).set(data);
   
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
  update(collection:string, document:string, data:any):Promise<void>{
    return this.firestore.collection(collection).doc(document).set(data, {merge:true});
  }
  delete(collection:string, document:string):Promise<void>{
    return this.firestore.collection(collection).doc(document).delete();
  }
}