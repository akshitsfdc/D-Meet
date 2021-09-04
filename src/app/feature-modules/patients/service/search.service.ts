import { HelperService } from './../../common-features/services/helper.service';
import { PatientFirestoreService } from './patient-firestore.service';
import { UtilsService } from './../../../services/utils.service';
import { DocumentData, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { FirestoreService } from './../../../services/firestore.service';
import { SearchedDoctor } from './../models/searched-doctor';
import { Injectable, OnDestroy } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { SessionService } from './session.service';
import { QueueModel } from '../../common-features/models/queue-model';
import { BookedPatient } from '../../common-features/models/booked-patient';
import { CalculationService } from '../../common-features/services/calculation.service';
import { DoctorUserData } from '../../common-features/models/doctor-user-data';
import { Observable } from 'rxjs';
import { ObjectHelperService } from '../../common-features/services/object-helper.service';

class TimerModel {
  timer: NodeJS.Timeout;
  bookingId: string
}

@Injectable()
export class SearchService {

  nearbyDoctors: SearchedDoctor[];
  globalDoctors: SearchedDoctor[];

  private globalLastVisible: DocumentData = null;
  private globalDocsLimit = 15;

  private currentQueue: QueueModel;

  private bookingTimers: TimerModel[];

  constructor(private firestore: FirestoreService,
    private pFirebase: PatientFirestoreService,
    private utils: UtilsService, private http: HttpService,
    private calculation: CalculationService,
    private session: SessionService,
    private objectHelper: ObjectHelperService,
    private helper: HelperService) {

    this.nearbyDoctors = [];
    this.globalDoctors = [];
    this.bookingTimers = [];

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
  private setDoctor(doctors: SearchedDoctor[], docs: QueryDocumentSnapshot<firebase.default.firestore.DocumentData>[]): void {

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

              queueObj
                .setNextPatient(this.objectHelper.findNextPatient(queueObj));

              break;

            case 'modified':
              currentRef.objectHelper
                .updateQueueOfUser(searchedDoctor.getQueues()
                  , queueObj);
              queueObj
                .setNextPatient(this.objectHelper.findNextPatient(queueObj));
              break;
            case 'removed':
              currentRef.objectHelper
                .deleteQueue(searchedDoctor.getQueues(), queueObj);
              break;

          }

          this.helper.setQueueLiveMessage(queueObj);

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

              queue.setBookingCheckCompleted(true);

              docChangeList.forEach(updatedPatient => {

                const patient: BookedPatient = new BookedPatient();

                Object.assign(patient, updatedPatient.payload.doc.data());
                patient.setDocReference(updatedPatient.payload.doc.ref);

                if (patient.getPatientId() === currentRef.session.getUserData().getUserId()) {
                  queue.setMyBooking(patient);
                  this.setMyBookingTimer(queue, patient);
                }

                switch (updatedPatient.payload.type) {

                  case 'added':
                    queue.getBookings().push(patient);
                    break;

                  case 'modified':
                    currentRef.objectHelper.updatePatient(patient, queue);
                    break;
                  case 'removed':
                    currentRef.objectHelper.deletePatient(queue.getBookings(), patient); break;

                }


              });
              currentRef.objectHelper.setCurrentPatient(queue);
              queue
                .setNextPatient(this.objectHelper.findNextPatient(queue));

              this.helper.setQueueLiveMessage(queue);

            });
      });
  }


  private setMyBookingTimer(queue: QueueModel, booking: BookedPatient) {

    booking.setSelfWaitingTime(this.calculation.getRemainingTimeBeforeMeeting(queue, booking));

    this.joinMeetingRoom(booking);

    if (this.timerSettingCompleted(booking.getBookingId())) {
      return;
    }

    let timerModel: TimerModel = new TimerModel();

    const interval: NodeJS.Timeout = setInterval(() => {

      const timeLeft = booking.getSelfWaitingTime() - 1000;

      if (timeLeft <= 0) {
        booking.setSelfWaitingTime(0);
        booking.setSelfWaitingTimeString('about to start...');
        clearInterval(interval);
        this.deleteFromTimers(timerModel)
        if (!this.amICurrentUser(queue)) {
          this.setMyBookingTimer(queue, booking);
        } else {
          booking.setSelfWaitingTimeString('Joined');
        }
      } else {
        booking.setSelfWaitingTime(timeLeft);
        booking.setSelfWaitingTimeString(this.calculation.getRemainingTimeString(timeLeft));
      }


    }, 1000);

    timerModel.bookingId = booking.getBookingId();
    timerModel.timer = interval;
    this.bookingTimers.push(timerModel);
  }

  private joinMeetingRoom(booking: BookedPatient) {

    console.log("booking.isCurrentPatient() : " + booking.isCurrentPatient());

    if (booking.isCurrentPatient()) {
      const timerModel: TimerModel = this.getTimerModel(booking.getBookingId());
      if (timerModel) {
        clearInterval(timerModel.timer);
        this.deleteFromTimers(timerModel);
      }
      booking.setSelfWaitingTime(0);
      booking.setSelfWaitingTimeString('Joined');
    }

  }
  private deleteFromTimers(timerModel: TimerModel) {
    const index = this.bookingTimers.indexOf(timerModel, 0);
    if (index > -1) {
      this.bookingTimers.splice(index, 1);
      console.log("Timer deleted");
    }
  }
  private timerSettingCompleted(bookingId: string): boolean {

    this.bookingTimers.forEach(timerModel => {
      if (timerModel.bookingId === bookingId) {
        return true;
      }
    });

    return false;
  }
  private getTimerModel(bookingId: string): TimerModel {

    this.bookingTimers.forEach(timerModel => {
      if (timerModel.bookingId === bookingId) {
        return timerModel;
      }
    });

    return null;
  }
  private amICurrentUser(queue: QueueModel): boolean {
    ;

    if (!this.session.getUserData() || !queue.getCurrentPatient()) {
      return false;
    }
    if (this.session.getUserData().getUserId() === queue.getCurrentPatient().getPatientId()) {
      return true
    }
    return false;
  }



}
