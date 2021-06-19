import { ManagementService } from './../../common-features/services/management.service';

import { AuthService } from './../../../services/auth.service';
import { UtilsService } from './../../../services/utils.service';
import { Injectable } from '@angular/core';

import { FirestoreService } from 'src/app/services/firestore.service';
import { HttpService } from 'src/app/services/http.service';
import { QueueModel } from '../../common-features/models/queue-model';
import { BookedPatient } from '../../common-features/models/booked-patient';
import { DoctorUserData } from '../../common-features/models/doctor-user-data';

@Injectable()

export class SessionService {

  private userData: DoctorUserData;
  private sharedData: any;


  private queues: QueueModel[];

  public profilePlaceholder = '/assets/imgs/profile_placeholder.svg';

  constructor(private utils: UtilsService,
    private firestore: FirestoreService, private http: HttpService,
    private authService: AuthService,
    private managerService: ManagementService) {

    this.queues = [];

    this.initSession();

  }

  public initSession(): void {
    this.authService.getUser()
      .then(userData => {
        this.loadDoctorData(userData.uid);
      })
      .catch(error => {
        // error
        console.log('no auth >> ');

      });
  }
  public getUserData(): DoctorUserData {
    return this.userData;
  }

  public setUserData(userData: DoctorUserData): void {
    this.userData = userData;
  }

  public getQueues(): QueueModel[] {
    return this.queues;
  }

  public setQueues(queues: QueueModel[]): void {

    this.queues = queues;

    // this.changeQueueStatus(this.queues);

  }
  public getSharedData(): any {
    return this.sharedData;
  }

  public setSharedData(sharedData: any): void {
    this.sharedData = sharedData;
  }


  private loadDoctorData(userId: string): void {

    const currentRef = this;

    this.firestore.getValueChanges('users', userId)
      .subscribe(

        {
          next(userData): void {
            const user: DoctorUserData = new DoctorUserData();
            Object.assign(user, userData);
            if (currentRef.getUserData() === null || currentRef.getUserData() === undefined) {
              currentRef.setUserData(user);
              currentRef.managerService.presenseManagement(user.getUserId(), user.isDoctor());
              console.log('got user data >> new ');
            } else {
              currentRef.updateUserData(user);
              console.log('got user data updated ');
            }

          },
          error(msg): void {
            console.log('Obs error >> : ' + msg);
          },
          complete: () => console.log('completed')
        });

    this.firestore.getQueuesCollection('users/' + userId + '/queues')
      .subscribe(docChangeList => {

        docChangeList.forEach(queue => {

          const queueObj: QueueModel = new QueueModel();

          Object.assign(queueObj, queue.payload.doc.data());
          queueObj.setDocRef(queue.payload.doc.ref);

          // console.log("patient >>> 123 >> "+JSON.stringify(patient));

          switch (queue.payload.type) {

            case 'added':
              currentRef.getUserData().getQueues().push(queueObj);
              currentRef.loadBookings(queueObj);
              currentRef.setNext(queueObj);
              break;

            case 'modified':
              // currentRef.changeQueueStatus(queueObj);
              // currentRef.updateQueueOfUser(queueObj);
              currentRef.setNext(queueObj);
              break;
            case 'removed':
              currentRef.deleteQueue(queueObj);
              break;

          }

        });

      });
  }
  private deleteQueue(queueUpdate: QueueModel): void {

    const queues = this.userData.getQueues();

    for (let i = 0; i < queues.length; ++i) {

      const queue = queues[i];

      if (queue.getQueueId() === queueUpdate.getQueueId()) {

        this.userData.getQueues().splice(i, 1);

        return;
      }

    }
  }
  private changeQueueStatus(queue: QueueModel): void {



    if (this.utils.isWithinTimeFrame(queue.getBookingStarting(), queue.getBookingEnding(), 'ist')) {
      queue.setStatus('booking');
    }

    if (this.utils.isWithinTimeFrame(queue.getConsultingStarting(), queue.getConsultingEnding(), 'ist')) {
      queue.setStatus('live');
    }


    if (this.utils.getTriggerTime(queue.getBookingStarting(), 'ist')) {
      setTimeout(() => {
        this.updateQueue(queue);
      }, this.utils.getTriggerTime(queue.getBookingStarting(), 'ist'));
    }


    if (this.utils.getTriggerTime(queue.getBookingEnding(), 'ist')) {
      setTimeout(() => {
        this.updateQueue(queue);
      }, this.utils.getTriggerTime(queue.getBookingEnding(), 'ist'));
    }


    if (this.utils.getTriggerTime(queue.getConsultingStarting(), 'ist')) {
      setTimeout(() => {
        this.updateQueue(queue);
      }, this.utils.getTriggerTime(queue.getConsultingStarting(), 'ist'));
    }


    if (this.utils.getTriggerTime(queue.getConsultingEnding(), 'ist')) {
      setTimeout(() => {
        this.updateQueue(queue, true);
      }, this.utils.getTriggerTime(queue.getConsultingEnding(), 'ist'));
    }
  }

  private updateQueue(queue: QueueModel, end?: boolean): void {

    console.log('updateQueue >> ');

    if (end) {
      queue.setStatus('scheduled');
      return;
    }
    if (this.utils.isWithinTimeFrame(queue.getBookingStarting(), queue.getBookingEnding(), 'ist')) {
      queue.setStatus('booking');
      console.log('status changed to booking.');
    } else {
      queue.setStatus('scheduled');
    }
    if (this.utils.isWithinTimeFrame(queue.getConsultingStarting(), queue.getConsultingEnding(), 'ist')) {
      queue.setStatus('live');
      console.log('status changed to live.');
    }

  }


  public loadBookings(queue: QueueModel): void {

    const currentRef = this;


    this.http.getServerDate()

      .then(dateObj => {

        const millies: number = this.utils.getUtCMillies(dateObj.timestapmIST);
        const date: Date = new Date(millies);
        const dateStr: string = date.getDate() + '' + date.getMonth() + '' + date.getFullYear();

        console.log('dateStr : ' + dateStr);


        this.firestore.getBookingChanges('queue-bookings',
          'doctorId', queue.getOwnerId(), 'dateString', dateStr,
          'queueId', queue.getQueueId(), 'bookingTimeServer')

          .subscribe(docChangeList => {

            docChangeList.forEach(updatedPatient => {

              // console.log(updatedPatient.payload.doc.data());
              // console.log(updatedPatient.payload.type);

              const patient: BookedPatient = new BookedPatient();

              Object.assign(patient, updatedPatient.payload.doc.data());
              patient.setDocReference(updatedPatient.payload.doc.ref);

              // console.log("patient >>> 123 >> "+JSON.stringify(patient));

              switch (updatedPatient.payload.type) {

                case 'added':
                  patient.setQueuePlace(queue.getBookings().length + 1);
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
        patient.setStatus(patientUpdate.getStatus());

        if (patient.isCurrentPatient()) {
          queue.setCurrentPatient(patient);
        }

        return;
      }

    }

  }

  private updateQueueOfUser(queueUpdate: QueueModel): void {

    const queues = this.userData.getQueues();

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < queues.length; ++i) {

      const queue = queues[i];

      if (queue.getQueueId() === queueUpdate.getQueueId()) {

        this.updateQueueModel(queue, queueUpdate);

        this.changeQueueStatus(queue);

        return;
      }

    }

  }


  private updateUserData(userDataUpdate: DoctorUserData): void {

    this.userData.setEmail(userDataUpdate.getEmail());
    this.userData.setFirstName(userDataUpdate.getFirstName());
    this.userData.setLastName(userDataUpdate.getLastName());
    this.userData.setGender(userDataUpdate.getGender());
    this.userData.setPicUrl(userDataUpdate.getPicUrl());
    this.userData.setUserId(userDataUpdate.getUserId());
    this.userData.setProfileId(userDataUpdate.getProfileId());

    this.userData.setRegistrationNumber(userDataUpdate.getRegistrationNumber());
    this.userData.setExperience(userDataUpdate.getExperience());
    this.userData.setDegree(userDataUpdate.getDegree());
    this.userData.setSpeciality(userDataUpdate.getSpeciality());
    this.userData.setClinicName(userDataUpdate.getClinicName());
    this.userData.setFullClinicAddress(userDataUpdate.getFullClinicAddress());
    this.userData.setCountry(userDataUpdate.getCountry());
    this.userData.setState(userDataUpdate.getState());
    this.userData.setCity(userDataUpdate.getCity());
    this.userData.setVarified(userDataUpdate.isVarified());
    this.userData.setAbout(userDataUpdate.getAbout());
    this.userData.setRegistrationLocalTimeStapm(userDataUpdate.getRegistrationLocalTimeStapm());
    this.userData.setKycSubmitted(userDataUpdate.isKycSubmitted());
    this.userData.setNearbyAddress(userDataUpdate.getNearbyAddress());
    this.userData.setDiseaseSpecialist(userDataUpdate.getDiseaseSpecialist());
    this.userData.setCoordinates(userDataUpdate.getCoordinates());
    this.userData.setStatus(userDataUpdate.getStatus());

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



  }

}
