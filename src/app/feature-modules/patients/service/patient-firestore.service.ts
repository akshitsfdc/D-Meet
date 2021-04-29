import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChangeAction, DocumentData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { PatientsModule } from '../patients.module';

@Injectable()
  
export class PatientFirestoreService {

  constructor(
    private firestore: AngularFirestore
  ) { 
  }

  public getScheduledMeetings(patientId:string, dateStr:string, limit:number):Observable<DocumentChangeAction<unknown>[]> {

    let collectionPath: string = "queue-bookings";

    
      return this.firestore.collection(collectionPath, ref =>
        ref.where("patientId", "==", patientId)
          .where("processed", "==", false)
          .where("dateString", "==", dateStr)
          .where("cancelled", "==", false)
          .limit(limit)
          .orderBy("bookingTimeServer", 'desc')
        )
        .stateChanges();
   
  }

  public getMyBookings(patientId: string, limit: number, firstRequest:boolean, document?:DocumentData): Promise<firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>>{
    
    let collectionPath: string = "queue-bookings";

    if (firstRequest) {
      return this.firestore.collection(collectionPath, ref =>
        ref.where("patientId", "==", patientId)
          .where("processed", "==", true)
          .limit(limit)
          .orderBy("processedTimeServer")
        
      ).get()
      .toPromise();
    } else {

      return this.firestore.collection(collectionPath, ref =>
        ref.where("patientId", "==", patientId)
          .where("processed", "==", true)          
          .limit(limit)
          .orderBy("processedTimeServer")
          .startAfter(document)
      ).get()
      .toPromise();
    }
    
      
  }
  public getMyFilteredBookings(patientId: string, limit: number, firstRequest:boolean, fromTime?:number, toTime?:number, document?:DocumentData): Promise<firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>>{
    
    let collectionPath: string = "queue-bookings";

    if (firstRequest) {
      return this.firestore.collection(collectionPath, ref =>
        ref.where("patientId", "==", patientId)
          .where("processed", "==", true)
          .where("processedTimeServer", ">=", fromTime)
          .where("processedTimeServer", "<=", toTime)
          .limit(limit)
          .orderBy("processedTimeServer")
        
      ).get()
      .toPromise();
    } else {

      return this.firestore.collection(collectionPath, ref =>
        ref.where("patientId", "==", patientId)
          .where("processed", "==", true)
          .where("processedTimeServer", ">=", fromTime)
          .where("processedTimeServer", "<=", toTime)
          .limit(limit)
          .orderBy("processedTimeServer")
          .startAfter(document)
      ).get()
      .toPromise();
    }
    
      
  }

  public getCancelledBookings(patientId: string, limit: number, firstRequest:boolean, document?:DocumentData): Promise<firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>>{
    
    let collectionPath: string = "queue-bookings";

    if (firstRequest) {
      return this.firestore.collection(collectionPath, ref =>
        ref.where("patientId", "==", patientId)
          .where("cancelled", "==", true)
          .limit(limit)
          .orderBy("processedTimeServer")
        
      ).get()
      .toPromise();
    } else {

      return this.firestore.collection(collectionPath, ref =>
        ref.where("patientId", "==", patientId)
          .where("cancelled", "==", true)          
          .limit(limit)
          .orderBy("processedTimeServer")
          .startAfter(document)
      ).get()
      .toPromise();
    }
    
      
  }
  public getCancelledFilteredBookings(patientId: string, limit: number, firstRequest:boolean, fromTime?:number, toTime?:number, document?:DocumentData): Promise<firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>>{
    
    let collectionPath: string = "queue-bookings";

    if (firstRequest) {
      return this.firestore.collection(collectionPath, ref =>
        ref.where("patientId", "==", patientId)
          .where("cancelled", "==", true)
          .where("processedTimeServer", ">=", fromTime)
          .where("processedTimeServer", "<=", toTime)
          .limit(limit)
          .orderBy("processedTimeServer")
        
      ).get()
      .toPromise();
    } else {

      return this.firestore.collection(collectionPath, ref =>
        ref.where("patientId", "==", patientId)
          .where("cancelled", "==", true)
          .where("processedTimeServer", ">=", fromTime)
          .where("processedTimeServer", "<=", toTime)
          .limit(limit)
          .orderBy("processedTimeServer")
          .startAfter(document)
      ).get()
      .toPromise();
    }
    
      
  }

  public getUnhandledBookings(patientId: string, limit: number, firstRequest:boolean, document?:DocumentData): Promise<firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>>{
    
    let collectionPath: string = "queue-bookings";

    if (firstRequest) {
      return this.firestore.collection(collectionPath, ref =>
        ref.where("patientId", "==", patientId)
          .where("cancelled", "==", false)
          .where("processed", "==", false)
          .limit(limit)
          .orderBy("bookingTimeServer")
        
      ).get()
      .toPromise();
    } else {

      return this.firestore.collection(collectionPath, ref =>
        ref.where("patientId", "==", patientId)
        .where("cancelled", "==", false)
          .where("processed", "==", false)
          .limit(limit)
          .orderBy("bookingTimeServer")
          .startAfter(document)
      ).get()
      .toPromise();
    }
    
      
  }
  public getUnhandledFilteredBookings(patientId: string, limit: number, firstRequest:boolean, fromTime?:number, toTime?:number, document?:DocumentData): Promise<firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>>{
    
    let collectionPath: string = "queue-bookings";

    if (firstRequest) {
      return this.firestore.collection(collectionPath, ref =>
        ref.where("patientId", "==", patientId)
        .where("cancelled", "==", false)
          .where("processed", "==", false)
          .where("bookingTimeServer", ">=", fromTime)
          .where("bookingTimeServer", "<=", toTime)
          .limit(limit)
          .orderBy("bookingTimeServer")
        
      ).get()
      .toPromise();
    } else {

      return this.firestore.collection(collectionPath, ref =>
        ref.where("patientId", "==", patientId)
        .where("cancelled", "==", false)
          .where("processed", "==", false)
          .where("bookingTimeServer", ">=", fromTime)
          .where("bookingTimeServer", "<=", toTime)
          .limit(limit)
          .orderBy("bookingTimeServer")
          .startAfter(document)
      ).get()
      .toPromise();
    }
    
      
  }

}
