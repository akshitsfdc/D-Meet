import { DoctorFirestoreService } from './doctor-firestore.service';
import { ObjectHelperService } from './../../common-features/services/object-helper.service';
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
    private firestore: DoctorFirestoreService,
    private http: HttpService,
    private authService: AuthService,
    private objectHelper: ObjectHelperService,
    private managerService: ManagementService) {

    this.userData = new DoctorUserData();
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

  }
  public getSharedData(): any {
    return this.sharedData;
  }

  public setSharedData(sharedData: any): void {
    this.sharedData = sharedData;
  }


  private loadDoctorData(userId: string): void {

    const currentRef = this;

    this.firestore.getUserDataObs(userId)
      .subscribe(docChangeList => {


        docChangeList.forEach(user => {

          const type: string = user.payload.type;

          const userData: DoctorUserData = new DoctorUserData();

          Object.assign(userData, user.payload.doc.data());
          userData.setRef(user.payload.doc.ref);
          switch (type) {

            case 'added':
              currentRef.objectHelper.updateDoctor(this.userData, userData);
              currentRef.managerService.presenseManagement(userData.getUserId(), userData.isDoctor());
              break;

            case 'modified':
              currentRef.objectHelper.updateDoctor(this.userData, userData);
              break;
            case 'removed':
              break;

          }

        });




      });

    this.firestore.getDoctorsQueues(userId)
      .subscribe(docChangeList => {

        docChangeList.forEach(queue => {

          const queueObj: QueueModel = new QueueModel();

          Object.assign(queueObj, queue.payload.doc.data());

          queueObj.setDocRef(queue.payload.doc.ref);

          switch (queue.payload.type) {

            case 'added':
              currentRef.getUserData().getQueues().push(queueObj);
              currentRef.loadBookings(queueObj);

              queueObj
                .setNextPatient(this.objectHelper.findNextPatient(queueObj));
              break;

            case 'modified':
              // currentRef.changeQueueStatus(queueObj);
              currentRef.objectHelper
                .updateQueueOfUser(this.userData.getQueues()
                  , queueObj);
              queueObj
                .setNextPatient(this.objectHelper.findNextPatient(queueObj));
              break;
            case 'removed':
              currentRef.objectHelper
                .deleteQueue(this.userData.getQueues(), queueObj);
              break;

          }

        });

      });
  }


  public loadBookings(queue: QueueModel): void {

    const currentRef = this;


    this.http.getServerDate()

      .then(dateObj => {

        const millies: number = this.utils.getUtCMillies(dateObj.timestapmIST);
        const date: Date = new Date(millies);
        const dateStr: string = date.getDate() + '' + date.getMonth() + '' + date.getFullYear();

        this.firestore.getBookingsForQueue(queue, dateStr,)

          .subscribe(docChangeList => {

            queue.setBookingCheckCompleted(true);

            docChangeList.forEach(updatedPatient => {

              const patient: BookedPatient = new BookedPatient();

              Object.assign(patient, updatedPatient.payload.doc.data());
              patient.setDocReference(updatedPatient.payload.doc.ref);

              switch (updatedPatient.payload.type) {

                case 'added':
                  queue.getBookings().push(patient);
                  break;

                case 'modified':
                  currentRef.objectHelper.updatePatient(patient, queue);
                  break;
                case 'removed':
                  currentRef.objectHelper.deletePatient(queue.getBookings(), patient);
                  break;

              }

            });
            queue
              .setNextPatient(this.objectHelper.findNextPatient(queue));
            currentRef.objectHelper.setCurrentPatient(queue);
          });
      });
  }


}
