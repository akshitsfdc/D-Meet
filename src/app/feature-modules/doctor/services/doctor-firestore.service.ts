import { FirestoreService } from 'src/app/services/firestore.service';
import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChangeAction, DocumentData, DocumentReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable()

export class DoctorFirestoreService {

    constructor(
        private firestore: AngularFirestore,
        private mainService: FirestoreService
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



}
