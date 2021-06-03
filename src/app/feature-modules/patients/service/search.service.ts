import { CalculationService } from './calculation.service';

import { UtilsService } from './../../../services/utils.service';
import { DocumentData, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { FirestoreService } from './../../../services/firestore.service';
import { SearchedDoctor } from './../models/searched-doctor';
import { Injectable } from '@angular/core';
import { DoctorUserData } from 'src/app/models/doctor-user-data';
import { HttpService } from 'src/app/services/http.service';
import { SessionService } from './session.service';
import { QueueModel } from '../../common-features/models/queue-model';
import { BookedPatient } from '../../common-features/models/booked-patient';

@Injectable()
export class SearchService {

  nearbyDoctors: SearchedDoctor[];
  globalDoctors: SearchedDoctor[];

  private globalLastVisible: DocumentData = null;
  private globalDocsLimit: number = 15;

  private currentQueue: QueueModel;

  private myMeetingInterval: NodeJS.Timeout;

  constructor(private firestore: FirestoreService, private utils: UtilsService, private http: HttpService, private session: SessionService, private calculate: CalculationService) {
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

    for (let i = 0; i < this.globalDoctors.length; ++i) {
      if (this.globalDoctors[i].getDoctor().getUserId() === doctorId) {
        return this.globalDoctors[i];
      }
    }
    return null;
  }
  public nGetDoctorById(doctorId: string): SearchedDoctor {

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

      this.firestore.getAll('user-data', this.globalDocsLimit).then(snapshots => {

        if (!snapshots || !snapshots.docs || snapshots.docs.length <= 0) {
          return;
        }

        this.globalLastVisible = snapshots.docs[snapshots.docs.length - 1];

        this.setDoctor(this.globalDoctors, snapshots.docs);

      })
        .catch(error => {
          //error
          console.log("error >> " + error);
        });
    } else {
      this.firestore.getAllStartAfter('user-data', this.globalDocsLimit, this.globalLastVisible).then(snapshots => {

        if (!snapshots || !snapshots.docs || snapshots.docs.length <= 0) {
          return;
        }

        this.globalLastVisible = snapshots.docs[snapshots.docs.length - 1];

        this.setDoctor(this.globalDoctors, snapshots.docs);

      })
        .catch(error => {
          //error
          console.log("error >> " + error);
        });
    }

  }
  private setDoctor(doctors: SearchedDoctor[], docs: QueryDocumentSnapshot<firebase.firestore.DocumentData>[]): void {

    docs.forEach(document => {

      let searchedDoctor: SearchedDoctor = new SearchedDoctor();


      searchedDoctor.setQueueInitialized(false);

      let doctor: DoctorUserData = new DoctorUserData();

      doctor.setRef(document.ref);

      Object.assign(doctor, document.data());

      searchedDoctor.setDoctor(doctor);

      doctors.push(searchedDoctor);

    });
  }

  public setDoctorQueues(searchedDoctor: SearchedDoctor): void {

    let utils: UtilsService = this.utils;
    let currentRef = this;
    searchedDoctor.setQueueLoading(true);

    let path: string = 'user-data/' + searchedDoctor.getDoctor().getUserId() + '/queues';

    this.firestore.getQueuesCollection(path)

      .subscribe(docChangeList => {


        searchedDoctor.setQueueInitialized(true);
        searchedDoctor.setQueueLoading(false);

        docChangeList.forEach(queue => {

          let queueObj: QueueModel = new QueueModel();

          Object.assign(queueObj, queue.payload.doc.data());
          queueObj.setDocRef(queue.payload.doc.ref);

          // console.log("patient >>> 123 >> "+JSON.stringify(patient));

          switch (queue.payload.type) {

            case "added":
              searchedDoctor.getQueues().push(queueObj);
              //currentRef.changeQueueStatus(queueObj);
              currentRef.getBookingsOfQueue(queueObj);
              break;

            case "modified":
              // currentRef.changeQueueStatus(queueObj);
              currentRef.updateQueueOfDoctor(queueObj, searchedDoctor);
              break;
            case "removed":
              currentRef.deleteQueue(queueObj, searchedDoctor);
              break;

          }

        });

      });

    // this.firestore.getRealtimeCollection(path)

    //   .subscribe({
    //     next(data) {

    //       console.log("searched service queue fetching..");

    //       let queues: QueueModel[] = [];

    //       data.forEach(element => {
    //         let queue: QueueModel = new QueueModel();
    //         Object.assign(queue, element.payload.doc.data());
    //         queues.push(queue);

    //         queue.setDocRef(element.payload.doc.ref);
    //         queue.setBookingAvailable(utils.isWithinTimeFrame(queue.getBookingStarting(), queue.getBookingEnding()));
    //         queue.setConsultingStarted(utils.isWithinTimeFrame(queue.getConsultingStarting(), queue.getConsultingEnding()));

    //         parentObj.getBookingsOfQueue(queue);


    //       });

    //       searchedDoctor.setQueues(queues);
    //       utils.changeQueueStatus(queues);
    //       searchedDoctor.setQueueInitialized(true);
    //       searchedDoctor.setQueueLoading(false);
    //       parentObj.reformCurrentQueue(searchedDoctor);
    //     },
    //     error(msg) {
    //       console.log("Obs error >> : " + msg);
    //       searchedDoctor.setQueueInitialized(false);
    //       searchedDoctor.setQueueLoading(false);
    //     },
    //     complete: () => console.log('queue loaded!')
    //   });
  }

  private reformCurrentQueue(searchedDoctor: SearchedDoctor): void {

    for (let i = 0; i < searchedDoctor.getQueues().length; ++i) {
      let queue: QueueModel = searchedDoctor.getQueues()[i];
      if (this.currentQueue && this.currentQueue.getQueueId() === queue.getQueueId() && this.currentQueue.getOwnerId() === queue.getOwnerId()) {
        this.currentQueue.setBookingStarting(queue.getBookingStarting());
        this.currentQueue.setBookingEnding(queue.getBookingEnding());
        this.currentQueue.setConsultingStarting(queue.getConsultingStarting());
        this.currentQueue.setConsultingEnding(queue.getConsultingEnding());
        this.currentQueue.setBookingAvailable(this.utils.isWithinTimeFrame(this.currentQueue.getBookingStarting(), this.currentQueue.getBookingEnding()));
        this.currentQueue.setConsultingStarted(this.utils.isWithinTimeFrame(this.currentQueue.getConsultingStarting(), this.currentQueue.getConsultingEnding()));
      }
    }

  }
  public getBookingsOfQueue(queue: QueueModel) {

    let currentPatient: BookedPatient;
    let currentRef = this;
    this.http.getServerDate()
      .then(dateObj => {

        const millies: number = this.utils.getUtCMillies(dateObj.timestapmIST);
        const date: Date = new Date(millies);
        const dateStr: string = date.getDate() + '' + date.getMonth() + '' + date.getFullYear();

        this.firestore.getBookingChanges("queue-bookings", "doctorId", queue.getOwnerId(), "dateString", dateStr, "queueId", queue.getQueueId(), "bookingTimeServer")
          .subscribe(

            docChangeList => {

              docChangeList.forEach(updatedPatient => {

                let patient: BookedPatient = new BookedPatient();

                Object.assign(patient, updatedPatient.payload.doc.data());
                patient.setDocReference(updatedPatient.payload.doc.ref);

                if (patient.getPatientId() === currentRef.session.getUserData().getUserId()) {
                  queue.setMyBooking(patient);
                }

                switch (updatedPatient.payload.type) {

                  case "added":
                    if (patient.isCurrentPatient()) {
                      queue.setCurrentPatient(patient);
                    }
                    queue.getBookings().push(patient);
                    break;

                  case "modified":
                    currentRef.updatePatient(patient, queue);
                    break;
                  case "removed":
                    break;

                }

              });
              // currentRef.setCurrentNext(queue);
            })
        /* {
           next(patients) {

             let bookedPatients: BookedPatient[] = [];
             let index = 1;
             patients.forEach(element => {

               let patient: BookedPatient = new BookedPatient();

               Object.assign(patient, element);
               bookedPatients.push(patient);
               //patient.setQueuePlace(index);

               ++index;
               if (patient.isCurrentPatient()) {
                 currentPatient = patient;
               }
               if (patient.getPatientId() === currentRef.session.getUserData().getUserId()) {
                 queue.setMyBooking(patient);
                 // currentRef.startMyMeetingTimer(patient);

               }
             });
             queue.setCurrentPatient(currentPatient);
             queue.setBookings(bookedPatients);
             currentRef.setCurrentNext(queue);
           },
           error(msg) {
             console.log("Obs error >> : " + msg);
           },
           complete: () => console.log('completed')
         });*/
      });
  }


  private setCurrentNext(queue: QueueModel) {


    queue.getBookings().forEach(patient => {
      if ((!patient.isCurrentPatient() && !patient.isProcessed())) {

        queue.setNextId(patient.getBookingId());

        queue.setNextNumber("" + patient.getQueuePlace());
        return;
      }

    });
  }


  private updateQueueOfDoctor(queueUpdate: QueueModel, searchedDoctor: SearchedDoctor) {

    let queues = searchedDoctor.getQueues();

    for (let i = 0; i < queues.length; ++i) {

      let queue = queues[i];

      if (queue.getQueueId() === queueUpdate.getQueueId()) {


        this.updateQueueModel(queue, queueUpdate);

        //this.changeQueueStatus(queue);

        return;
      }

    }

  }

  private deleteQueue(queueUpdate: QueueModel, searchedDoctor: SearchedDoctor): void {

    let queues = searchedDoctor.getQueues();

    for (let i = 0; i < queues.length; ++i) {

      let queue = queues[i];

      if (queue.getQueueId() === queueUpdate.getQueueId()) {

        queues.splice(i, 1);

        return;
      }

    }
  }

  private updatePatient(patientUpdate: BookedPatient, queue: QueueModel) {


    for (let i = 0; i < queue.getBookings().length; ++i) {

      let patient = queue.getBookings()[i];

      if (patientUpdate.getBookingId() === patient.getBookingId()) {

        patient.setName(patientUpdate.getName())
        patient.setPhone(patientUpdate.getPhone());
        patient.setCurrentPatient(patientUpdate.isCurrentPatient());
        patient.setPending(patientUpdate.isPending());
        patient.setProcessed(patientUpdate.isProcessed());
        patient.setPicUrl(patientUpdate.getPicUrl());
        patient.setSelectionTime(patientUpdate.getSelectionTime());
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
