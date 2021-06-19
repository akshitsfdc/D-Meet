import { CalculationService } from './../../common-features/services/calculation.service';
import { HelperService } from './../../common-features/services/helper.service';
import { DoctorFirestoreService } from './../services/doctor-firestore.service';
import { PatientUserData } from './../../../models/patient-user-data';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UtilsService } from 'src/app/services/utils.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MovePatientComponent } from '../../doctor/move-patient/move-patient.component';
import { LoadingDialogComponent } from 'src/app/loading-dialog/loading-dialog.component';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
import { SessionService } from '../services/session.service';
import { Router } from '@angular/router';
import { BookedPatient } from '../../common-features/models/booked-patient';
import { QueueModel } from '../../common-features/models/queue-model';
import { DoctorUserData } from '../../common-features/models/doctor-user-data';

declare var Razorpay: any;

@Component({
  selector: 'app-meetup-lobby',
  templateUrl: './meetup-lobby.component.html',
  styleUrls: ['./meetup-lobby.component.scss']
})
export class MeetupLobbyComponent implements OnInit, OnDestroy {

  @ViewChild('bookingList') bookingListElement: ElementRef;

  rippleColor = '#4294f4';
  selectedStatus = 'live';
  selectStatusDisplay = 'Live';

  bookingavailable = false;

  disableNext = false;

  tempPatients = [];
  processedPatients = [];

  consultStarted = true;

  currentDoctor: DoctorUserData;
  currentPaient: BookedPatient;
  nextPatient: BookedPatient;

  totalPatientSize: number;
  currentQueue: QueueModel;

  extraheight: number = 75 + 15 + 60;
  consultingStartWaitingTimeLabel = '0h:00m';

  bookingStartingWaitingTime = 0;
  // tslint:disable-next-line:ban-types
  bookingStartingWaitingTimeLabel: String = '0h:00m';

  private myWaitingTimeTimer;

  private consultingStartWaitingTime = 0;
  private loading: MatDialogRef<LoadingDialogComponent>;

  selftWaitingTime = '';

  userData: PatientUserData;

  // tslint:disable-next-line:no-inferrable-types
  private currentMeetingTime: number = 0;

  private bstartingInterval: NodeJS.Timeout;
  private bEndInterval: NodeJS.Timeout;
  private cstartingInterval: NodeJS.Timeout;

  private queueQuardInterval: NodeJS.Timeout;
  private selfWaitingInterval: NodeJS.Timeout;
  private currentBookingInterval: NodeJS.Timeout;
  private processingPatientId: string;
  private processingPatientSelectionTime: number;
  // tslint:disable-next-line:no-trailing-whitespace


  constructor(private matDialog: MatDialog, private router: Router,
    public utils: UtilsService, public session: SessionService,
    private firestoreService: DoctorFirestoreService,
    public helper: HelperService,
    public calculation: CalculationService) {


  }



  ngOnInit(): void {

    this.currentQueue = this.session.getSharedData().queue as QueueModel;

    this.currentDoctor = this.session.getSharedData().doctor as DoctorUserData;

    // this.bookingAvailability();

    // this.consultingStarted();

    // this.setTimerForAvailability();

    this.startLobbyTimers();

  }


  private startLobbyTimers(): void {

    this.currentQueue.setBookingStartRemaingTime(this.calculation.timeDiffrenceFromNow(this.currentQueue.getBookingStarting()) * 1000);

    this.bstartingInterval = setInterval(() => {

      if (this.currentQueue.getBookingStartRemaingTime() <= 0) {
        this.currentQueue.setBookingStartRemaingTime(0);
        clearInterval(this.bstartingInterval);
      } else {
        this.currentQueue.setBookingStartRemaingTime(this.currentQueue.getBookingStartRemaingTime() - 1000);
      }

    }, 1000);

    this.currentQueue.setConsultingStartingRemaingTime(
      this.calculation.timeDiffrenceFromNow(this.currentQueue.getConsultingStarting()) * 1000);

    this.cstartingInterval = setInterval(() => {


      if (this.currentQueue.getConsultingStartingRemaingTime() <= 0) {
        this.currentQueue.setConsultingStartingRemaingTime(0);
        clearInterval(this.cstartingInterval);
      } else {
        this.currentQueue.setConsultingStartingRemaingTime(this.currentQueue.getConsultingStartingRemaingTime() - 1000);
      }

    }, 1000);

    this.currentQueue.setBookingEndingRemaingTime(this.calculation.timeDiffrenceFromNow(this.currentQueue.getBookingEnding()) * 1000);

    this.bEndInterval = setInterval(() => {


      if (this.currentQueue.getBookingEndingRemaingTime() <= 0) {
        this.currentQueue.setBookingEndingRemaingTime(0);
        clearInterval(this.bEndInterval);
      } else {
        this.currentQueue.setBookingEndingRemaingTime(this.currentQueue.getBookingEndingRemaingTime() - 1000);
      }

    }, 1000);


    // this is generic timer which take care of queue state every 1 second
    this.queueQuardInterval = setInterval(() => {

      const currentBooking: BookedPatient = this.currentQueue.getCurrentPatient();

      if (currentBooking
        && (currentBooking.getBookingId() !== this.processingPatientId
          || currentBooking.getSelectionTime() !== this.processingPatientSelectionTime) && currentBooking.getSelectionTime() > 0) {

        this.processingPatientId = currentBooking.getBookingId();
        this.processingPatientSelectionTime = currentBooking.getSelectionTime();

        if (this.currentBookingInterval) {
          clearInterval(this.currentBookingInterval);
        }
        this.setCurrentMeetingTime(currentBooking);
      }

    }, 1000);

  }

  private setCurrentMeetingTime(booking: BookedPatient): void {

    this.currentMeetingTime = this.calculation.getTimePassed(booking.getSelectionTime()) * 1000;

    this.currentBookingInterval = setInterval(() => {
      this.currentMeetingTime += 1000;
    }, 1000);

  }

  // private setTimerForAvailability(): void {

  //   setInterval(() => {
  //     this.bookingAvailability();
  //     this.consultingStarted();
  //   }, 60000);
  // }

  // tslint:disable-next-line:use-lifecycle-interface
  ngAfterViewInit(): void {

    const windowHeight = window.innerHeight;
    // this.bookingListElement.nativeElement.style.height = 50 +'px';    // set height
    this.bookingListElement.nativeElement.style.height = (windowHeight - this.extraheight) + 'px';
  }

  @HostListener('window:resize', ['$event'])
  onResize(event): void {
    const windowHeight = window.innerHeight;
    this.bookingListElement.nativeElement.style.height = (windowHeight - this.extraheight) + 'px';
  }
  initConsultingWaitingTime(): void {
    setInterval(() => {
      this.consultingStartWaitingTime -= 60000;
      this.consultingStartWaitingTimeLabel = this.utils.getDateDigits(this.consultingStartWaitingTime);
      console.log(this.consultingStartWaitingTimeLabel);
    }, 60000);
  }

  initBookingWaitingTime(): void {
    setInterval(() => {
      if (this.bookingStartingWaitingTime > 0) {
        this.bookingStartingWaitingTime -= 60000;
        this.bookingStartingWaitingTimeLabel = this.utils.getDateDigits(this.bookingStartingWaitingTime);
        console.log(this.bookingStartingWaitingTime);
      }
    }, 60000);
  }
  drop(event: CdkDragDrop<string[]>): void {
    // moveItemInArray(this.movies, event.previousIndex, event.currentIndex);
  }

  goPatientMeet(): void {
    // this.router.navigate(['patientMeet'], { relativeTo: this.route });
    this.saveData();
  }


  // nextPatient(){

  //   this.processedPatients.push(this.currentPaient);

  //   if(this.tempPatients.length > 0){
  //     this.currentPaient = this.tempPatients.splice(0, 1)[0];
  //   }

  //   if(this.processedPatients.length === this.totalPatientSize){
  //     // this.processedPatients.push(this.currentPaient);
  //     // this.currentPaient = this.tempPatients.splice(0, 1)[0];
  //     this.disableNext = true;
  //   }

  // }
  movePatient(): void {

    const dialogData = {
      maxPosition: this.tempPatients.length,
      minPosition: this.tempPatients.length > 2 ? 2 : this.tempPatients.length
    };


    const dialog = this.matDialog.open(MovePatientComponent, { data: dialogData });

    dialog.afterClosed().subscribe(result => {

      if (result && !result.canceled) {
        if (result.defined) {
          this.shiftPatientToPosition(result.position);
        } else {
          this.shiftPatientToLast();
        }
      }



    });
  }

  private shiftPatientToPosition(position: number): void {

    if (this.tempPatients.length > 0) {
      this.tempPatients.splice(position, 0, this.currentPaient);
      this.currentPaient = this.tempPatients.splice(0, 1)[0];
    }

  }

  private shiftPatientToLast(): void {

    if (this.tempPatients.length > 0) {
      this.tempPatients.splice(this.tempPatients.length, 0, this.currentPaient);
      this.currentPaient = this.tempPatients.splice(0, 1)[0];
    }


  }
  statusChanged(): void {
    switch (this.selectedStatus) {
      case 'live': {
        this.selectStatusDisplay = 'Live';
        break;
      }
      case 'offline': {
        this.selectStatusDisplay = 'Offline';
        break;
      }
      default: {
        this.selectStatusDisplay = 'Away';
        break;
      }
    }
  }

  private saveData(): void {
    // const roomRef = this.firestore.collection('doctor-meta').doc((+ new Date()).toString());
    // roomRef.set(this.getCitydata());

    // const coollection = this.firestore.collection('cities');
    // this.firestore
    // .collection('cities', ref => ref.where("state", "==", "Uttar Pradesh").where("country", "==", "India"))
    // .get().toPromise().then((querySnapshot) => {
    //   querySnapshot.forEach((doc) => {
    //        console.log(doc.id, "=>", doc.data());
    //   });
    // });
  }





  private showDialog(type: string, msg: string, ok: string): void {

    const dialogData = {
      type,
      message: msg,
      okText: ok
    };

    this.matDialog.open(MessageDialogComponent, {
      data: dialogData, disableClose: false,
      maxWidth: '300px'
    }).afterClosed().toPromise()
      .then(result => {

      });
  }



  private showLoading(): void {

    this.utils.showLoading('Please wait...');

  }
  private hideLoading(): void {
    this.utils.hideLoading();
  }

  bookingAvailability(): void {
    this.currentQueue.setBookingAvailable(
      this.utils.isWithinTimeFrame(this.currentQueue.getBookingStarting(), this.currentQueue.getBookingEnding()));
  }
  consultingStarted(): void {
    this.currentQueue.setConsultingStarted(
      this.utils.isWithinTimeFrame(this.currentQueue.getConsultingStarting(), this.currentQueue.getConsultingEnding()));
  }

  startTimerCounter(): void {
    this.myWaitingTimeTimer = setInterval(() => {
      this.changeSelfWaitingTime();
    }, 1000);


  }



  changeSelfWaitingTime(): void {
    console.log('Outside >> ');
    if (this.currentQueue.getBookings().length > 0 && this.currentQueue.getMyBooking()) {

      console.log('Inside >> ');

      this.currentQueue.getMyBooking().setSelfWaitingTime(+new Date());
    }
  }

  finalizeCurrent(makePending: boolean): void {

    let serverInput;
    let currentUserInput;
    this.showLoading();

    if (makePending) {
      serverInput = {
        currentPatient: false, processed: false, pending: true
      };
    } else {
      serverInput = {
        currentPatient: false, processed: true, pending: false
      };
    }
    currentUserInput = {
      currentPatient: true, processed: false, pending: false
    };

    this.nextPatient = this.findNextPatient();

    let queueEnded = false;
    let queueData: any;

    if (this.nextPatient === null) {
      queueEnded = true;
      queueData = { queueEnded: true, currentNumber: 0 };
    } else {
      queueEnded = false;
      queueData = { queueEnded: false, currentNumber: this.nextPatient.getQueuePlace() };
    }

    this.firestoreService.finalizeCurrentPatient(
      this.currentQueue.getCurrentPatient().getDocReference(), this.nextPatient?.getDocReference(),
      this.currentQueue.getDocRef(), serverInput, currentUserInput, queueData, queueEnded)
      .then(() => {

        if (queueEnded) {
          this.currentQueue.setCurrentPatient(null);
        }
        this.hideLoading();
      })
      .catch(error => {
        this.hideLoading();
        console.log('Error in finalizing current patient');

      });

    // *******
    // if (queueEnded) {
    //   this.currentQueue.setCurrentPatient(null);
    // }
    // *******

    // this.firestoreService.update("queue-bookings", documentString, serverInput)
    //   .then(() => {

    //     this.nextPatient = this.findNextPatient();

    //     if (this.nextPatient === null) {
    //       this.hideLoading();
    //       console.log("queue ended.");
    //       this.currentQueue.setCurrentPatient(null);
    //       return;
    //     }


    //     let documentString = this.nextPatient.getPatientId() + "_" + this.nextPatient.getBookingId();

    //     this.firestoreService.update("queue-bookings", documentString, currentUserInput)
    //       .then(() => {

    //         this.hideLoading();
    //         console.log("Success.");

    //       })
    //       .catch(error => {
    //         //error
    //         this.hideLoading();
    //         console.log("Error making current user.");
    //       });

    //   })
    //   .catch(error => {
    //     //error
    //     this.hideLoading();
    //     console.log("Error updating current user.");
    //   })


  }

  startQueueProcessing(): void {


    if (this.currentQueue.getBookings().length < 1) {
      // error
      return;
    }

    let currentUserInput;
    this.showLoading();

    currentUserInput = {
      currentPatient: true, processed: false, pending: false
    };

    const firstPatient: BookedPatient = this.findNextPatient();
    if (firstPatient === null) {
      this.hideLoading();
      return;
    }

    let queueData: any;


    queueData = { currentNumber: firstPatient.getQueuePlace() };


    console.log('queue started with : ');


    this.firestoreService.startQueue(firstPatient.getDocReference(), this.currentQueue.getDocRef(), currentUserInput, queueData)
      .then(() => {
        // this.nextPatient = this.findNextPatient();
        this.hideLoading();
        console.log('Success started queue!');

      })
      .catch(error => {
        // error
        this.hideLoading();
        console.log('Failed started queue!');
      });


  }

  private findNextPatient(): BookedPatient {

    const pId: string = this.currentQueue.getCurrentPatient()?.getBookingId() || '';

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.currentQueue.getBookings().length; ++i) {
      console.log('searching for candidate..');
      const patient = this.currentQueue.getBookings()[i];

      if (!patient.isPending() && !patient.isProcessed() && pId !== patient.getBookingId()) {
        console.log('Canndidate..mached!');
        return patient;
      }

    }

    return this.findNextPendingPatient();

  }

  private findNextPendingPatient(): BookedPatient {

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.currentQueue.getBookings().length; ++i) {
      console.log('searching for pending candidates..');
      const patient = this.currentQueue.getBookings()[i];

      if (patient.isPending() && !patient.isProcessed()) {
        return patient;
      }

    }

    return null;

  }
  navigateToMeeting(currentPatient: BookedPatient): void {

    const data = {
      queue: this.session.getSharedData().queue as QueueModel,
      doctor: this.session.getSharedData().doctor as DoctorUserData,
      currentPatient
    };

    this.session.setSharedData(data);
    this.router.navigate(['doctor/conference']);
  }
  ngOnDestroy(): void {
    if (this.myWaitingTimeTimer) {
      clearInterval(this.myWaitingTimeTimer);
    }
  }
}

