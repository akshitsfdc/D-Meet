import { PatientFirestoreService } from './patient-firestore.service';
import { UtilsService } from './../../../services/utils.service';
import { DocumentData, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { FirestoreService } from './../../../services/firestore.service';
import { SearchedDoctor } from './../models/searched-doctor';
import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { SessionService } from './session.service';
import { QueueModel } from '../../common-features/models/queue-model';
import { BookedPatient } from '../../common-features/models/booked-patient';
import { CalculationService } from '../../common-features/services/calculation.service';
import { DoctorUserData } from '../../common-features/models/doctor-user-data';

@Injectable()
export class SearchService {

  nearbyDoctors: SearchedDoctor[];
  globalDoctors: SearchedDoctor[];

  private globalLastVisible: DocumentData = null;
  private globalDocsLimit = 15;

  private currentQueue: QueueModel;

  private myMeetingInterval: NodeJS.Timeout;

  constructor(private firestore: FirestoreService,
    private pFirebase: PatientFirestoreService,
    private utils: UtilsService, private http: HttpService,
    private session: SessionService, private calculate: CalculationService) {
    this.nearbyDoctors = [];
    this.globalDoctors = [];
    this.globalLastVisible = null;
    this.globalDocsLimit = 15;
    this.currentQueue = null;
    this.loadDoctors();
  }

  public getCurrentQueue(): QueueModel {

    return this.currentQueue;
  }

  public gGetDoctorById(doctorId: string): SearchedDoctor {

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.globalDoctors.length; ++i) {
      if (this.globalDoctors[i].getDoctor().getUserId() === doctorId) {
        return this.globalDoctors[i];
      }
    }
    return null;
  }
  public nGetDoctorById(doctorId: string): SearchedDoctor {

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.nearbyDoctors.length; ++i) {
      if (this.nearbyDoctors[i].getDoctor().getUserId() === doctorId) {
        return this.nearbyDoctors[i];
      }
    }
    return null;
  }

  public setCurrentQueue(currentQueue: QueueModel): void {
    this.currentQueue = currentQueue;
  }

  public getNearbyDoctors(): SearchedDoctor[] {
    return this.nearbyDoctors;
  }

  public getGlobalDoctors(): SearchedDoctor[] {
    return this.globalDoctors;
  }

  public getGlobalDocsLimit(): number {
    return this.globalDocsLimit;
  }

  public setGlobalDocsLimit(globalDocsLimit: number): void {
    this.globalDocsLimit = globalDocsLimit;
  }

  public loadSearch(): void {

    // this.firestore.get('userdata');

  }

  public loadDoctors(): void {

    if (this.globalLastVisible === null) {

      this.pFirebase.getGlobalDoctorsAll('users', this.globalDocsLimit).then(snapshots => {

        if (!snapshots || !snapshots.docs || snapshots.docs.length <= 0) {
          return;
        }

        this.globalLastVisible = snapshots.docs[snapshots.docs.length - 1];

        this.setDoctor(this.globalDoctors, snapshots.docs);

      })
        .catch(error => {
          // error
          console.log('error >> ' + error);
        });
    } else {
      this.pFirebase.getGlobalDoctorsStartAfter('users', this.globalDocsLimit, this.globalLastVisible).then(snapshots => {

        if (!snapshots || !snapshots.docs || snapshots.docs.length <= 0) {
          return;
        }

        this.globalLastVisible = snapshots.docs[snapshots.docs.length - 1];

        this.setDoctor(this.globalDoctors, snapshots.docs);

      })
        .catch(error => {
          // error
          console.log('error >> ' + error);
        });
    }

  }
  private setDoctor(doctors: SearchedDoctor[], docs: QueryDocumentSnapshot<firebase.firestore.DocumentData>[]): void {

    docs.forEach(document => {

      const searchedDoctor: SearchedDoctor = new SearchedDoctor();


      searchedDoctor.setQueueInitialized(false);

      const doctor: DoctorUserData = new DoctorUserData();

      doctor.setRef(document.ref);

      Object.assign(doctor, document.data());

      searchedDoctor.setDoctor(doctor);

      doctors.push(searchedDoctor);

    });
  }

  public setDoctorQueues(searchedDoctor: SearchedDoctor): void {

    const utils: UtilsService = this.utils;
    const currentRef = this;
    searchedDoctor.setQueueLoading(true);

    const path: string = 'users/' + searchedDoctor.getDoctor().getUserId() + '/queues';

    this.firestore.getQueuesCollection(path)

      .subscribe(docChangeList => {


        searchedDoctor.setQueueInitialized(true);
        searchedDoctor.setQueueLoading(false);

        docChangeList.forEach(queue => {

          const queueObj: QueueModel = new QueueModel();

          Object.assign(queueObj, queue.payload.doc.data());
          queueObj.setDocRef(queue.payload.doc.ref);

          // console.log("patient >>> 123 >> "+JSON.stringify(patient));

          switch (queue.payload.type) {

            case 'added':
              searchedDoctor.getQueues().push(queueObj);
              // currentRef.changeQueueStatus(queueObj);
              currentRef.getBookingsOfQueue(queueObj);

              currentRef.setNext(queueObj);

              break;

            case 'modified':
              // currentRef.changeQueueStatus(queueObj);
              currentRef.updateQueueOfDoctor(queueObj, searchedDoctor);
              currentRef.setNext(queueObj);
              break;
            case 'removed':
              currentRef.deleteQueue(queueObj, searchedDoctor);
              break;

          }

        });


      });


  }

  public getBookingsOfQueue(queue: QueueModel): void {

    const currentRef = this;
    this.http.getServerDate()
      .then(dateObj => {

        const millies: number = this.utils.getUtCMillies(dateObj.timestapmIST);
        const date: Date = new Date(millies);
        const dateStr: string = date.getDate() + '' + date.getMonth() + '' + date.getFullYear();

        this.firestore.getBookingChanges('queue-bookings', 'doctorId', queue.getOwnerId(),
          'dateString', dateStr, 'queueId', queue.getQueueId(), 'bookingTimeServer')
          .subscribe(

            docChangeList => {

              docChangeList.forEach(updatedPatient => {

                const patient: BookedPatient = new BookedPatient();

                Object.assign(patient, updatedPatient.payload.doc.data());
                patient.setDocReference(updatedPatient.payload.doc.ref);

                if (patient.getPatientId() === currentRef.session.getUserData().getUserId()) {
                  queue.setMyBooking(patient);
                }

                switch (updatedPatient.payload.type) {

                  case 'added':
                    if (patient.isCurrentPatient()) {
                      queue.setCurrentPatient(patient);
                    }
                    queue.getBookings().push(patient);
                    break;

                  case 'modified':
                    currentRef.updatePatient(patient, queue);
                    break;
                  case 'removed':
                    break;

                }

              });
              currentRef.setNext(queue);
              currentRef.setCurrentPatient(queue);
              // currentRef.setCurrentNext(queue);
            });
      });
  }


  private setNext(queue: QueueModel): void {

    queue.setNextPatient(this.findNextPatient(queue));

  }

  private setCurrentPatient(queue: QueueModel): void {

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < queue.getBookings().length; ++i) {
      const patient = queue.getBookings()[i];
      if (patient.isCurrentPatient()) {
        queue.setCurrentPatient(patient);
        return;
      }

    }
    queue.setCurrentPatient(null);
  }


  private findNextPatient(queue: QueueModel): BookedPatient {

    const pId: string = queue.getCurrentPatient()?.getBookingId() || '';

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < queue.getBookings().length; ++i) {
      const patient = queue.getBookings()[i];
      if (!patient.isPending() && !patient.isProcessed() && pId !== patient.getBookingId()) {
        return patient;
      }

    }

    return this.findNextPendingPatient(queue);

  }

  private findNextPendingPatient(queue: QueueModel): BookedPatient {

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < queue.getBookings().length; ++i) {
      const patient = queue.getBookings()[i];

      console.log('Searching for pending patients');

      if (patient.isPending() && !patient.isProcessed()) {
        console.log('Found pending patient');
        return patient;
      }

    }
    return null;
  }

  private updateQueueOfDoctor(queueUpdate: QueueModel, searchedDoctor: SearchedDoctor): void {

    const queues = searchedDoctor.getQueues();

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < queues.length; ++i) {

      const queue = queues[i];

      if (queue.getQueueId() === queueUpdate.getQueueId()) {


        this.updateQueueModel(queue, queueUpdate);

        // this.changeQueueStatus(queue);

        return;
      }

    }

  }

  private deleteQueue(queueUpdate: QueueModel, searchedDoctor: SearchedDoctor): void {

    const queues = searchedDoctor.getQueues();

    for (let i = 0; i < queues.length; ++i) {

      const queue = queues[i];

      if (queue.getQueueId() === queueUpdate.getQueueId()) {

        queues.splice(i, 1);

        return;
      }

    }
  }

  private updatePatient(patientUpdate: BookedPatient, queue: QueueModel): void {


    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < queue.getBookings().length; ++i) {

      const patient = queue.getBookings()[i];

      if (patientUpdate.getBookingId() === patient.getBookingId()) {

        patient.setName(patientUpdate.getName());
        patient.setPhone(patientUpdate.getPhone());
        patient.setCurrentPatient(patientUpdate.isCurrentPatient());
        patient.setPending(patientUpdate.isPending());
        patient.setProcessed(patientUpdate.isProcessed());
        patient.setPicUrl(patientUpdate.getPicUrl());
        patient.setSelectionTime(patientUpdate.getSelectionTime());
        patient.setStatus(patientUpdate.getStatus());

        if (patient.isCurrentPatient()) {
          queue.setCurrentPatient(patient);
        }

        return;
      }

    }

  }


  private updateQueueModel(queueOriginal: QueueModel, queue: QueueModel): void {


    queueOriginal.setCurrency(queue.getCurrency());
    queueOriginal.setFees(queue.getFees());
    queueOriginal.setStatus(queue.getStatus());
    queueOriginal.setActive(queue.isActive());
    queueOriginal.setPatientLimit(queue.getPatientLimit());
    queueOriginal.setTimePerPatient(queue.getTimePerPatient());
    queueOriginal.setBookingStarting(queue.getBookingStarting());
    queueOriginal.setBookingEnding(queue.getBookingEnding());
    queueOriginal.setConsultingStarting(queue.getConsultingStarting());
    queueOriginal.setConsultingEnding(queue.getConsultingEnding());
    queueOriginal.setBookedPatients(queue.getBookedPatients());
    queueOriginal.setQueueId(queue.getQueueId());
    queueOriginal.setOwnerId(queue.getOwnerId());
    queueOriginal.setHolidayList(queue.getHolidayList());
    queueOriginal.setType(queue.getType());
    queueOriginal.setPaymentOption(queue.getPaymentOption());
    queueOriginal.setStatus(queue.getStatus());
    queueOriginal.setTodayDateString(queue.getTodayDateString());
    queueOriginal.setCurrentBookingsCount(queue.getCurrentBookingsCount());
    queueOriginal.setNextNumber(queue.getNextNumber());
    queueOriginal.setCurrentNumber(queue.getCurrentNumber());

    // private nextNumber: string;
    // private currentNumber: number;

    queueOriginal.setBookingStartRemaingTime(this.calculate.timeDiffrenceFromNow(queueOriginal.getBookingStarting()) * 1000);
    queueOriginal.setBookingEndingRemaingTime(this.calculate.timeDiffrenceFromNow(queueOriginal.getBookingEnding()) * 1000);
    queueOriginal.setConsultingStartingRemaingTime(this.calculate.timeDiffrenceFromNow(queueOriginal.getConsultingStarting()) * 1000);


  }

}
