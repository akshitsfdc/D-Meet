
import { UtilsService } from './../../../services/utils.service';
import { DocumentData, DocumentReference, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { GeoService } from './../../../services/geo.service';
import { FirestoreService } from './../../../services/firestore.service';
import { SearchedDoctor } from './../models/searched-doctor';
import { Injectable } from '@angular/core';
import { DoctorUserData } from 'src/app/models/doctor-user-data';
import { QueueModel } from 'src/app/models/queue-model';
import { HttpService } from 'src/app/services/http.service';
import { BookedPatient } from 'src/app/models/booked-patient';
import { queue } from 'rxjs/internal/scheduler/queue';
import { SessionService } from './session.service';

@Injectable()
export class SearchService {

  nearbyDoctors: SearchedDoctor[];
  globalDoctors: SearchedDoctor[];

  private globalLastVisible: DocumentData = null;
  private globalDocsLimit: number = 15;

  private currentQueue: QueueModel;



  constructor(private firestore: FirestoreService, private utils: UtilsService, private http: HttpService, private session: SessionService) {
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
    let parentObj = this;
    searchedDoctor.setQueueLoading(true);

    let path: string = 'user-data/' + searchedDoctor.getDoctor().getUserId() + '/queues';
    this.firestore.getRealtimeCollection(path)

      .subscribe({
        next(data) {

          let queues: QueueModel[] = [];

          data.forEach(element => {
            let queue: QueueModel = new QueueModel();
            Object.assign(queue, element.payload.doc.data());
            queues.push(queue);

            queue.setDocRef(element.payload.doc.ref);
            queue.setBookingAvailable(utils.isWithinTimeFrame(queue.getBookingStarting(), queue.getBookingEnding()));
            queue.setConsultingStarted(utils.isWithinTimeFrame(queue.getConsultingStarting(), queue.getConsultingEnding()));

            parentObj.getBookingsOfQueue(queue);
          });

          searchedDoctor.setQueues(queues);
          utils.changeQueueStatus(queues);
          searchedDoctor.setQueueInitialized(true);
          searchedDoctor.setQueueLoading(false);
          parentObj.reformCurrentQueue(searchedDoctor);
        },
        error(msg) {
          console.log("Obs error >> : " + msg);
          searchedDoctor.setQueueInitialized(false);
          searchedDoctor.setQueueLoading(false);
        },
        complete: () => console.log('queue loaded!')
      });
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
    this.http.getServerDate("serverDate")
      .then(dateObj => {

        const millies: number = this.utils.getUtCMillies(dateObj.timestapmIST);
        const date: Date = new Date(millies);
        const dateStr: string = date.getDate() + '' + date.getMonth() + '' + date.getFullYear();

        this.firestore.getRealTimeCollectionWithQuery("queue-bookings", "doctorId", queue.getOwnerId(), "dateString", dateStr, "queueId", queue.getQueueId(), "bookingTimeServer")
          .subscribe(
            {
              next(patients) {

                let bookedPatients: BookedPatient[] = [];
                let index = 1;
                patients.forEach(element => {
                  let patient: BookedPatient = new BookedPatient();
                  Object.assign(patient, element);
                  bookedPatients.push(patient);
                  patient.setQueuePlace(index);
                  ++index;
                  if (patient.isCurrentPatient()) {
                    currentPatient = patient;
                  }
                  if (patient.getPatientId() === currentRef.session.getUserData().getUserId()) {
                    queue.setMyBooking(patient)
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
            });
      });
  }

  public getBookingsOfQueueOneTime(queue: QueueModel) {

    let currentPatient: BookedPatient;
    let currentRef = this;
    this.http.getServerDate("serverDate")
      .then(dateObj => {

        const millies: number = this.utils.getUtCMillies(dateObj.timestapmIST);
        const date: Date = new Date(millies);
        const dateStr: string = date.getDate() + '' + date.getMonth() + '' + date.getFullYear();

        this.firestore.getRealTimeCollectionWithQuery("queue-bookings", "doctorId",
          queue.getOwnerId(), "dateString", dateStr,
          "queueId", queue.getQueueId(), "bookingTimeServer")
          .toPromise()
          .then(patients => {

            let bookedPatients: BookedPatient[] = [];
            let index = 1;
            patients.forEach(element => {
              let patient: BookedPatient = new BookedPatient();
              Object.assign(patient, element);
              bookedPatients.push(patient);
              patient.setQueuePlace(index);
              ++index;
              if (patient.isCurrentPatient()) {
                currentPatient = patient;
              }
              if (patient.getPatientId() === currentRef.session.getUserData().getUserId()) {
                queue.setMyBooking(patient)
              }
            });
            queue.setCurrentPatient(currentPatient);
            queue.setBookings(bookedPatients);
            currentRef.setCurrentNext(queue);
          })

          .catch(error => {
            console.log("Error getting booked patients : " + error);
          });
      })
      .catch(error => {
        console.log("Error getting current date from server : " + error);

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

}
