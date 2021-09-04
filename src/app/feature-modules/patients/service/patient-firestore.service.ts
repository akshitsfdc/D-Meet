import { FirestoreService } from 'src/app/services/firestore.service';
import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChangeAction, DocumentData, DocumentReference, QuerySnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { QueueModel } from '../../common-features/models/queue-model';

@Injectable()

export class PatientFirestoreService {

  constructor(
    private firestore: AngularFirestore,
    private mainService: FirestoreService
  ) {
  }

  public getByRef(docRef: DocumentReference): Promise<firebase.default.firestore.DocumentSnapshot<firebase.default.firestore.DocumentData>> {
    return docRef.get();
  }
  public getScheduledMeetings(patientId: string, dateStr: string, limit: number): Observable<DocumentChangeAction<unknown>[]> {

    const collectionPath = 'queue-bookings';


    return this.firestore.collection(collectionPath, ref =>
      ref.where('patientId', '==', patientId)
        .where('processed', '==', false)
        .where('dateString', '==', dateStr)
        .where('cancelled', '==', false)
        .limit(limit)
        .orderBy('bookingTimeServer', 'desc')
    )
      .stateChanges();

  }

  public getMyBookings(patientId: string, limit: number,
    firstRequest: boolean, document?: DocumentData): Promise<firebase.default.firestore.QuerySnapshot<firebase.default.firestore.DocumentData>> {

    const collectionPath = 'queue-bookings';

    if (firstRequest) {
      return this.firestore.collection(collectionPath, ref =>
        ref.where('patientId', '==', patientId)
          .where('processed', '==', true)
          .limit(limit)
          .orderBy('processedTimeServer')

      ).get()
        .toPromise();
    } else {

      return this.firestore.collection(collectionPath, ref =>
        ref.where('patientId', '==', patientId)
          .where('processed', '==', true)
          .limit(limit)
          .orderBy('processedTimeServer')
          .startAfter(document)
      ).get()
        .toPromise();
    }


  }
  public getMyFilteredBookings(patientId: string, limit: number,
    firstRequest: boolean,
    fromTime?: number, toTime?: number,
    document?: DocumentData): Promise<firebase.default.firestore.QuerySnapshot<firebase.default.firestore.DocumentData>> {

    const collectionPath = 'queue-bookings';

    if (firstRequest) {
      return this.firestore.collection(collectionPath, ref =>
        ref.where('patientId', '==', patientId)
          .where('processed', '==', true)
          .where('processedTimeServer', '>=', fromTime)
          .where('processedTimeServer', '<=', toTime)
          .limit(limit)
          .orderBy('processedTimeServer')

      ).get()
        .toPromise();
    } else {

      return this.firestore.collection(collectionPath, ref =>
        ref.where('patientId', '==', patientId)
          .where('processed', '==', true)
          .where('processedTimeServer', '>=', fromTime)
          .where('processedTimeServer', '<=', toTime)
          .limit(limit)
          .orderBy('processedTimeServer')
          .startAfter(document)
      ).get()
        .toPromise();
    }


  }

  public getCancelledBookings(patientId: string,
    limit: number,
    firstRequest: boolean,
    document?: DocumentData): Promise<firebase.default.firestore.QuerySnapshot<firebase.default.firestore.DocumentData>> {

    const collectionPath = 'queue-bookings';

    if (firstRequest) {
      return this.firestore.collection(collectionPath, ref =>
        ref.where('patientId', '==', patientId)
          .where('cancelled', '==', true)
          .limit(limit)
          .orderBy('processedTimeServer')

      ).get()
        .toPromise();
    } else {

      return this.firestore.collection(collectionPath, ref =>
        ref.where('patientId', '==', patientId)
          .where('cancelled', '==', true)
          .limit(limit)
          .orderBy('processedTimeServer')
          .startAfter(document)
      ).get()
        .toPromise();
    }


  }
  public getCancelledFilteredBookings(patientId: string,
    limit: number,
    firstRequest: boolean,
    fromTime?: number,
    toTime?: number,
    document?: DocumentData): Promise<firebase.default.firestore.QuerySnapshot<firebase.default.firestore.DocumentData>> {

    const collectionPath = 'queue-bookings';

    if (firstRequest) {
      return this.firestore.collection(collectionPath, ref =>
        ref.where('patientId', '==', patientId)
          .where('cancelled', '==', true)
          .where('processedTimeServer', '>=', fromTime)
          .where('processedTimeServer', '<=', toTime)
          .limit(limit)
          .orderBy('processedTimeServer')

      ).get()
        .toPromise();
    } else {

      return this.firestore.collection(collectionPath, ref =>
        ref.where('patientId', '==', patientId)
          .where('cancelled', '==', true)
          .where('processedTimeServer', '>=', fromTime)
          .where('processedTimeServer', '<=', toTime)
          .limit(limit)
          .orderBy('processedTimeServer')
          .startAfter(document)
      ).get()
        .toPromise();
    }


  }

  public getUnhandledBookings(patientId: string,
    limit: number,
    firstRequest: boolean,
    document?: DocumentData): Promise<firebase.default.firestore.QuerySnapshot<firebase.default.firestore.DocumentData>> {

    const collectionPath = 'queue-bookings';

    if (firstRequest) {
      return this.firestore.collection(collectionPath, ref =>
        ref.where('patientId', '==', patientId)
          .where('cancelled', '==', false)
          .where('processed', '==', false)
          .limit(limit)
          .orderBy('bookingTimeServer')

      ).get()
        .toPromise();
    } else {

      return this.firestore.collection(collectionPath, ref =>
        ref.where('patientId', '==', patientId)
          .where('cancelled', '==', false)
          .where('processed', '==', false)
          .limit(limit)
          .orderBy('bookingTimeServer')
          .startAfter(document)
      ).get()
        .toPromise();
    }


  }
  public getUnhandledFilteredBookings(patientId: string,
    limit: number,
    firstRequest: boolean,
    fromTime?: number,
    toTime?: number,
    document?: DocumentData): Promise<firebase.default.firestore.QuerySnapshot<firebase.default.firestore.DocumentData>> {

    const collectionPath = 'queue-bookings';

    if (firstRequest) {
      return this.firestore.collection(collectionPath, ref =>
        ref.where('patientId', '==', patientId)
          .where('cancelled', '==', false)
          .where('processed', '==', false)
          .where('bookingTimeServer', '>=', fromTime)
          .where('bookingTimeServer', '<=', toTime)
          .limit(limit)
          .orderBy('bookingTimeServer')

      ).get()
        .toPromise();
    } else {

      return this.firestore.collection(collectionPath, ref =>
        ref.where('patientId', '==', patientId)
          .where('cancelled', '==', false)
          .where('processed', '==', false)
          .where('bookingTimeServer', '>=', fromTime)
          .where('bookingTimeServer', '<=', toTime)
          .limit(limit)
          .orderBy('bookingTimeServer')
          .startAfter(document)
      ).get()
        .toPromise();
    }


  }
  public updateDocument(docRef: DocumentReference, data: any): Promise<void> {
    return this.mainService.updateDocument(docRef, data);
  }

  public sendPostpondRequest(doctorId: string, request: any, pDocRef: DocumentReference, pData: any): Promise<void> {

    const collectionPath: string = 'user-data/' + doctorId + '/notifications';

    const dNotiRef: DocumentReference = this.firestore.collection(collectionPath).doc(request.notificationId).ref;

    const batch = this.firestore.firestore.batch();


    batch.set(dNotiRef, request, { merge: true });

    // pData.docReference = null;
    batch.update(pDocRef, pData);

    return batch.commit();

  }

  public sendRefundRequest(doctorId: string, notification: any, pDocRef: DocumentReference, pData: any, request: any): Promise<void> {

    const notificationPath: string = 'user-data/' + doctorId + '/notifications';
    const requestPath = 'refund-requests';


    const dNotiRef: DocumentReference = this.firestore.collection(notificationPath).doc(notification.notificationId).ref;
    const requestRef: DocumentReference = this.firestore.collection(requestPath).doc(notification.notificationId).ref;

    const batch = this.firestore.firestore.batch();

    batch.set(dNotiRef, notification, { merge: true });

    batch.set(requestRef, request, { merge: true });

    // pData.docReference = null;
    batch.update(pDocRef, pData);

    return batch.commit();

  }

  public sendCancelMeetingBatch(doctorId: string, request: any, pDocRef: DocumentReference, pData: any): Promise<void> {


    // this.firestore.firestore.runTransaction()

    const collectionPath: string = 'user-data/' + doctorId + '/notifications';

    const dNotiRef: DocumentReference = this.firestore.collection(collectionPath).doc(request.notificationId).ref;

    const batch = this.firestore.firestore.batch();


    batch.set(dNotiRef, request, { merge: true });

    // pData.docReference = null;
    batch.update(pDocRef, pData);

    return batch.commit();

  }

  public saveBooking(dateString: string, booking: any): Promise<void> {

    // console.log("patient - firestore >> booking : " + JSON.stringify(booking));

    console.log('patientFirestoreService >> saveBooking : ' + booking.doctorId);

    const collectionPathQ: string = 'users/' + booking.doctorId + '/queues';

    const queueRef: DocumentReference = this.firestore.collection(collectionPathQ).doc(booking.queueId).ref;

    const bookingDocId = booking.patientId + '_' + booking.bookingId;

    const bookingRef: DocumentReference = this.firestore.collection('queue-bookings').doc(bookingDocId).ref;

    return this.firestore.firestore.runTransaction(transaction =>
      // This code may get re-run multiple times if there are conflicts.
      transaction.get(queueRef)
        .then(queue => {

          console.log('Transaction >> get completed !');

          const queueModel: QueueModel = new QueueModel();
          Object.assign(queueModel, queue.data());
          const newcount = (queueModel.getCurrentBookingsCount() || 0) + 1;

          if (dateString === queueModel.getTodayDateString()) {
            transaction.update(queueRef, { currentBookingsCount: newcount });

            booking.queuePlace = newcount;
          } else {
            transaction.update(queueRef, { currentBookingsCount: 1, todayDateString: dateString });
            booking.queuePlace = 1;
          }
          transaction.set(bookingRef, booking);

        })
        .catch(error => {
          console.log('Error getting queue info : ' + error);
          return Promise.reject("Something went wrong!");
        })
    );
    // .then(() => console.log("Transaction successfully committed!"))
    // .catch(error => console.log("Transaction failed: ", error));
  }

  public getGlobalDoctorsStartAfter(collection: string, limit: number, document: DocumentData): Promise<QuerySnapshot<DocumentData>> {

    return this.firestore.collection(collection, ref =>
      ref
        .where('doctor', '==', true)
        .startAfter(document)
        .limit(limit))
      .get().toPromise();

  }
  public getGlobalDoctorsAll(collection: string, limit: number): Promise<QuerySnapshot<DocumentData>> {

    return this.firestore.collection(collection, ref =>
      ref
        .where('doctor', '==', true)
        .limit(limit))
      .get().toPromise();

  }

}
