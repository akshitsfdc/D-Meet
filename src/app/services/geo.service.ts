import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentData, DocumentSnapshot } from '@angular/fire/firestore';

import * as firebase from 'firebase';

import { GeoCollectionReference, GeoDocumentReference, GeoFirestore, GeoQuery } from 'geofirestore';


@Injectable({
  providedIn: 'root'
})

export class GeoService {

  geofirestore: GeoFirestore;
  geocollection: GeoCollectionReference;

  constructor() {
    this.geofirestore = new GeoFirestore(firebase.default.firestore());
  }

  public setGeoCollection(collectionName: string): void {
    this.geocollection = this.geofirestore.collection(collectionName);
  }

  getGeopoints(lat: number, long: number): firebase.default.firestore.GeoPoint {

    return new firebase.default.firestore.GeoPoint(lat, long);
  }

  saveInGeoCollection(documentId: string, data: any): Promise<void> {
    return this.geocollection.doc(documentId).set(data);
  }

  getnearbyDoctors(lat: number, long: number, rad: number, limit: number): Promise<any> {

    const query: GeoQuery = this.geocollection.near({ center: new firebase.default.firestore.GeoPoint(lat, long), radius: rad });

    return query.limit(limit).get();
  }


}
