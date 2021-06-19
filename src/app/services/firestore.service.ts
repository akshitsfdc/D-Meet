import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Action, AngularFirestore, DocumentChangeAction, DocumentData, DocumentSnapshot, Query, QuerySnapshot, DocumentReference } from '@angular/fire/firestore';

import * as firebase from 'firebase';


@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  private serviceDate: any;

  constructor(
    private firestore: AngularFirestore
  ) {
  }

  public getServiceDate(): any {
    return this.serviceDate;
  }

  public setServiceDate(serviceDate: any): void {
    this.serviceDate = serviceDate;
  }



  public save(collection: string, document: string, data: any): Promise<void> {

    return this.firestore.collection(collection).doc(document).set(data);

  }

  public updateDocument(documentRef: DocumentReference, data: any): Promise<void> {
    return documentRef.update(data);
  }

  public getEqualsObs(collection: string, key: string, value: string): Observable<firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>> {
    return this.firestore.collection(collection, ref => ref.where(key, '==', value)).get();
  }
  public getEquals(collection: string, key: string, value: string): Promise<firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>> {
    return this.firestore.collection(collection, ref => ref.where(key, '==', value)).get().toPromise();
  }
  public getEqualsDouble(collection: string, key1: string, value1: string, key2: string, value2: string): Promise<firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>> {
    return this.firestore.collection(collection, ref => ref.where(key1, '==', value1).where(key2, '==', value2)).get().toPromise();
  }
  public get(collection: string, document: string): Promise<firebase.firestore.DocumentSnapshot> {

    return this.firestore.collection(collection).doc(document).get().toPromise();

  }

  public getObs(collection: string, document: string): Observable<firebase.firestore.DocumentSnapshot> {

    return this.firestore.collection(collection).doc(document).get();

  }
  public getValueChanges(collection: string, document: string): Observable<unknown> {

    return this.firestore.collection(collection).doc(document).valueChanges();

  }
  public getRealtimeCollection(collection: string): Observable<DocumentChangeAction<unknown>[]> {

    return this.firestore.collection(collection).snapshotChanges();

  }
  public getQueuesCollection(collection: string): Observable<DocumentChangeAction<unknown>[]> {

    return this.firestore.collection(collection).stateChanges();

  }
  public getIceChangesCollection(collection: string): Observable<DocumentChangeAction<unknown>[]> {

    return this.firestore.collection(collection).stateChanges();

  }
  // stateChanges
  public getRealTimeCollectionWithQuery(collection: string, key1: string, value1: string, key2: string, value2: string, key3: string, value3: string, orderBy: string): Observable<unknown[]> {
    return this.firestore.collection(collection, ref =>
      ref.where(key1, '==', value1)
        .where(key2, '==', value2)
        .where(key3, '==', value3)
        .orderBy(orderBy))
      .valueChanges();
  }
  public getBookingChanges(collection: string, key1: string, value1: string, key2: string, value2: string, key3: string, value3: string, orderBy: string): Observable<DocumentChangeAction<unknown>[]> {
    return this.firestore.collection(collection, ref =>
      ref.where(key1, '==', value1)
        .where(key2, '==', value2)
        .where(key3, '==', value3)
        .orderBy(orderBy))
      .stateChanges();
  }
  public update(collection: string, document: string, data: any): Promise<void> {
    return this.firestore.collection(collection).doc(document).set(data, { merge: true });
  }
  public delete(collection: string, document: string): Promise<void> {
    return this.firestore.collection(collection).doc(document).delete();
  }

  public getAllStartAfter(collection: string, limit: number, document: DocumentData): Promise<QuerySnapshot<DocumentData>> {

    return this.firestore.collection(collection, ref => ref.startAfter(document).limit(limit))
      .get().toPromise();

  }
  public getAll(collection: string, limit: number): Promise<QuerySnapshot<DocumentData>> {

    return this.firestore.collection(collection, ref => ref.limit(limit))
      .get().toPromise();

  }
  public getDocChanges(collection: string, document: string): Observable<Action<DocumentSnapshot<unknown>>> {
    return this.firestore.collection(collection).doc(document).snapshotChanges();
  }

  public getPrescriptionChanges(collection: string, key1: string, value1: string, key2: string, value2: string, limit: number, orderBy: string): Observable<DocumentChangeAction<unknown>[]> {
    return this.firestore.collection(collection, ref =>
      ref.where(key1, '==', value1)
        .where(key2, '==', value2)
        .limit(limit)
        .orderBy(orderBy))
      .stateChanges();
  }

  public getMyBookingsP(patientId: string, dateStr: string, processed: boolean, cancelled: boolean, limit: number): Observable<DocumentChangeAction<unknown>[]> {

    const collectionPath = 'queue-bookings';

    if (cancelled) {
      return this.firestore.collection(collectionPath, ref =>
        ref.where('patientId', '==', patientId)
          .where('cancelled', '==', cancelled)
          .limit(limit)
          .orderBy('bookingTimeServer')
      )
        .stateChanges();
    }
    if (processed) {
      return this.firestore.collection(collectionPath, ref =>
        ref.where('patientId', '==', patientId)
          .where('processed', '==', processed)
          .limit(limit)
          .orderBy('bookingTimeServer')
      )
        .stateChanges();
    } else {
      return this.firestore.collection(collectionPath, ref =>
        ref.where('patientId', '==', patientId)
          .where('processed', '==', processed)
          .where('dateString', '==', dateStr)
          .where('cancelled', '==', cancelled)
          .limit(limit)
          .orderBy('bookingTimeServer')
      )
        .stateChanges();
    }

  }

}
