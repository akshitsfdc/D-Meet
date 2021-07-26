import { Injectable } from '@angular/core';
import { Action, AngularFirestore, DocumentChangeAction, DocumentData, DocumentReference, DocumentSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { QueueModel } from '../../common-features/models/queue-model';

@Injectable()

export class DoctorFirestoreService {

    constructor(
        private firestore: AngularFirestore
    ) {
    }

    public getByRef(docRef: DocumentReference): Promise<firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>> {

        return docRef.get();

    }
    public updateByDoc(docRef: DocumentReference, data): Promise<void> {
        return docRef.update(data);
    }

    public startQueue(bookingCurrentRef: DocumentReference, queueRef: DocumentReference, currentData: any, queueData: any): Promise<void> {

        const batch = this.firestore.firestore.batch();

        batch.update(bookingCurrentRef, currentData);

        batch.update(queueRef, queueData);

        return batch.commit();
    }

    public finalizeCurrentPatient(bookingCurrentRef: DocumentReference, bookingNextRef: DocumentReference,
        queueRef: DocumentReference, currentData: any,
        nextData: any, queueData: any, queueEnded: boolean): Promise<void> {

        const batch = this.firestore.firestore.batch();

        batch.update(bookingCurrentRef, currentData);

        if (!queueEnded) {
            batch.update(bookingNextRef, nextData);
        }

        batch.update(queueRef, queueData);

        return batch.commit();


    }


    public getUserDataObs(userId: string): Observable<DocumentChangeAction<unknown>[]> {


        return this.firestore.collection('users', ref =>
            ref.where('userId', '==', userId)
                .limit(1))
            .stateChanges();

    }

    public getDoctorsQueues(userId: string): Observable<DocumentChangeAction<unknown>[]> {

        const collectionPath: string = 'users/' + userId + '/queues'
        return this.firestore.collection(collectionPath).stateChanges();

    }

    public getBookingsForQueue(queue: QueueModel, dateStr: string): Observable<DocumentChangeAction<unknown>[]> {

        return this.firestore.collection('queue-bookings', ref =>
            ref.where('doctorId', '==', queue.getOwnerId())
                .where('dateString', '==', dateStr)
                .where('queueId', '==', queue.getQueueId())
                .orderBy('bookingTimeServer'))
            .stateChanges();
    }



}
