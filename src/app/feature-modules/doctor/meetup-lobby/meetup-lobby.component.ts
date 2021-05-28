import { DoctorFirestoreService } from './../services/doctor-firestore.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { PatientUserData } from './../../../models/patient-user-data'
import { DoctorUserData } from './../../../models/doctor-user-data';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UtilsService } from 'src/app/services/utils.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MovePatientComponent } from '../../doctor/move-patient/move-patient.component';
import { QueueModel } from 'src/app/models/queue-model';
import { LoadingDialogComponent } from 'src/app/loading-dialog/loading-dialog.component';
import { BookedPatient } from '../../../models/booked-patient';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
import { SessionService } from '../services/session.service';
import { Router } from '@angular/router';

declare var Razorpay: any;

@Component({
  selector: 'app-meetup-lobby',
  templateUrl: './meetup-lobby.component.html',
  styleUrls: ['./meetup-lobby.component.scss']
})
export class MeetupLobbyComponent implements OnInit, OnDestroy {

  @ViewChild('bookingList') bookingListElement: ElementRef;

  rippleColor = "#4294f4";
  selectedStatus = "live";
  selectStatusDisplay = "Live";

  bookingavailable: boolean = false;

  disableNext = false;

  tempPatients = [];
  processedPatients = [];

  consultStarted = true;

  currentDoctor: DoctorUserData;
  currentPaient: BookedPatient;
  nextPatient: BookedPatient;

  totalPatientSize: Number;
  currentQueue: QueueModel;

  extraheight: number = 75 + 15 + 60;
  consultingStartWaitingTimeLabel: string = "0h:00m"

  bookingStartingWaitingTime: number = 0;
  bookingStartingWaitingTimeLabel: String = "0h:00m";

  movies = [
    'Episode I - The Phantom Menace',
    'Episode II - Attack of the Clones',
    'Episode III - Revenge of the Sith',
    'Episode IV - A New Hope',
    'Episode V - The Empire Strikes Back',
    'Episode VI - Return of the Jedi',
    'Episode VII - The Force Awakens',
    'Episode VIII - The Last Jedi',
    'Episode IV - A New Hope',
    'Episode I - The Phantom Menace',
    'Episode II - Attack of the Clones',
    'Episode III - Revenge of the Sith',
    'Episode IV - A New Hope',
    'Episode V - The Empire Strikes Back',
    'Episode VI - Return of the Jedi',
    'Episode VII - The Force Awakens',
    'Episode VIII - The Last Jedi',
    'Episode IV - A New Hope',
    'Episode III - Revenge of the Sith',
    'Episode IV - A New Hope',
    'Episode V - The Empire Strikes Back',
    'Episode VI - Return of the Jedi',
    'Episode VII - The Force Awakens',
    'Episode VIII - The Last Jedi',
    'Episode IV - A New Hope',
    'Episode I - The Phantom Menace',
    'Episode II - Attack of the Clones',
    'Episode III - Revenge of the Sith',
    'Episode IV - A New Hope',
    'Episode V - The Empire Strikes Back',
    'Episode VI - Return of the Jedi',
    'Episode VII - The Force Awakens',
    'Episode VIII - The Last Jedi',
    'Episode IV - A New Hope',

  ];

  private myWaitingTimeTimer;

  private consultingStartWaitingTime: number = 0;
  private loading: MatDialogRef<LoadingDialogComponent>;

  selftWaitingTime: string = "";

  userData: PatientUserData;

  constructor(private matDialog: MatDialog, private router: Router,
    public utils: UtilsService, private session: SessionService, private firestoreService: DoctorFirestoreService) {


  }



  ngOnInit(): void {

    this.currentQueue = this.session.getSharedData().queue as QueueModel;

    this.currentDoctor = this.session.getSharedData().doctor as DoctorUserData;

    this.bookingAvailability();

    this.consultingStarted();

    this.setTimerForAvailability();


    // if (!this.currentQueue.isConsultingStarted()) {

    //   this.consultingStartWaitingTime = this.utils.getTimeDifference(this.currentQueue.getConsultingStarting());

    //   this.consultingStartWaitingTimeLabel = this.utils.getDateDigits(this.consultingStartWaitingTime);

    //   this.initConsultingWaitingTime();


    // }

    // if (!this.currentQueue.isBookingAvailable()) {

    //   this.bookingStartingWaitingTime = this.utils.getTimeDifference(this.currentQueue.getBookingStarting());

    //   this.bookingStartingWaitingTimeLabel = this.utils.getDateDigits(this.bookingStartingWaitingTime);

    //   this.initBookingWaitingTime();
    // }


    // this.startTimerCounter();


  }


  private setTimerForAvailability() {

    setInterval(() => {
      this.bookingAvailability();
      this.consultingStarted();
    }, 60000);
  }

  ngAfterViewInit() {

    let windowHeight = window.innerHeight;
    // this.bookingListElement.nativeElement.style.height = 50 +'px';    // set height
    this.bookingListElement.nativeElement.style.height = (windowHeight - this.extraheight) + 'px';
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    let windowHeight = window.innerHeight;
    this.bookingListElement.nativeElement.style.height = (windowHeight - this.extraheight) + 'px';
  }
  initConsultingWaitingTime() {
    setInterval(() => {
      this.consultingStartWaitingTime -= 60000;
      this.consultingStartWaitingTimeLabel = this.utils.getDateDigits(this.consultingStartWaitingTime);
      console.log(this.consultingStartWaitingTimeLabel);
    }, 60000);
  }

  initBookingWaitingTime() {
    setInterval(() => {
      if (this.bookingStartingWaitingTime > 0) {
        this.bookingStartingWaitingTime -= 60000;
        this.bookingStartingWaitingTimeLabel = this.utils.getDateDigits(this.bookingStartingWaitingTime);
        console.log(this.bookingStartingWaitingTime);
      }
    }, 60000);
  }
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.movies, event.previousIndex, event.currentIndex);
  }

  goPatientMeet() {
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
  movePatient() {

    let dialogData = {
      maxPosition: this.tempPatients.length,
      minPosition: this.tempPatients.length > 2 ? 2 : this.tempPatients.length
    }


    let dialog = this.matDialog.open(MovePatientComponent, { data: dialogData });

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

  private shiftPatientToPosition(position: number) {

    if (this.tempPatients.length > 0) {
      this.tempPatients.splice(position, 0, this.currentPaient);
      this.currentPaient = this.tempPatients.splice(0, 1)[0];
    }

  }

  private shiftPatientToLast() {

    if (this.tempPatients.length > 0) {
      this.tempPatients.splice(this.tempPatients.length, 0, this.currentPaient);
      this.currentPaient = this.tempPatients.splice(0, 1)[0];
    }


  }
  statusChanged() {
    switch (this.selectedStatus) {
      case "live": {
        this.selectStatusDisplay = "Live";
        break;
      }
      case "offline": {
        this.selectStatusDisplay = "Offline";
        break;
      }
      default: {
        this.selectStatusDisplay = "Away";
        break;
      }
    }
  }

  private saveData() {
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

    let dialogData = {
      type: type,
      message: msg,
      okText: ok
    }

    this.matDialog.open(MessageDialogComponent, {
      data: dialogData, disableClose: false,
      maxWidth: '300px'
    }).afterClosed().toPromise()
      .then(result => {

      });
  }



  private showLoading() {

    this.utils.showLoading("Please wait...");

  }
  private hideLoading() {
    this.utils.hideLoading();
  }

  bookingAvailability() {
    this.currentQueue.setBookingAvailable(this.utils.isWithinTimeFrame(this.currentQueue.getBookingStarting(), this.currentQueue.getBookingEnding()));
  }
  consultingStarted() {
    this.currentQueue.setConsultingStarted(this.utils.isWithinTimeFrame(this.currentQueue.getConsultingStarting(), this.currentQueue.getConsultingEnding()));
  }

  startTimerCounter() {
    this.myWaitingTimeTimer = setInterval(() => {
      this.changeSelfWaitingTime();
    }, 1000);


  }



  changeSelfWaitingTime() {
    console.log("Outside >> ");
    if (this.currentQueue.getBookings().length > 0 && this.currentQueue.getMyBooking()) {

      console.log("Inside >> ");

      this.currentQueue.getMyBooking().setSelfWaitingTime(+new Date());
    }
  }

  finalizeCurrent(makePending: boolean): void {

    let serverInput;
    let currentUserInput;
    this.showLoading();

    if (makePending) {
      serverInput = {
        "currentPatient": false, "processed": false, "pending": true
      };
    } else {
      serverInput = {
        "currentPatient": false, "processed": true, "pending": false
      };
    }
    currentUserInput = {
      "currentPatient": true, "processed": false, "pending": false
    };

    this.nextPatient = this.findNextPatient();

    let queueEnded: boolean = false;
    let queueData: any;

    if (this.nextPatient === null) {
      queueEnded = true;
      queueData = { queueEnded: true, currentNumber: 0 };
    } else {
      queueEnded = false;
      queueData = { queueEnded: false, currentNumber: this.nextPatient.getQueuePlace() };
    }

    this.firestoreService.finalizeCurrentPatient(this.currentQueue.getCurrentPatient().getDocReference(), this.nextPatient?.getDocReference(),
      this.currentQueue.getDocRef(), serverInput, currentUserInput, queueData, queueEnded)
      .then(() => {

        if (queueEnded) {
          this.currentQueue.setCurrentPatient(null);
        }
        this.hideLoading();
      })
      .catch(error => {
        this.hideLoading();
        console.log("Error in finalizing current patient");

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

  startQueueProcessing() {


    if (this.currentQueue.getBookings().length < 1) {
      //error
      return;
    }

    let currentUserInput;
    this.showLoading();

    currentUserInput = {
      "currentPatient": true, "processed": false, "pending": false
    };

    let firstPatient: BookedPatient = this.findNextPatient();
    if (firstPatient === null) {
      this.hideLoading();
      return;
    }

    let queueData: any;


    queueData = { currentNumber: firstPatient.getQueuePlace() };


    console.log("queue started with : ");


    this.firestoreService.startQueue(firstPatient.getDocReference(), this.currentQueue.getDocRef(), currentUserInput, queueData)
      .then(() => {
        // this.nextPatient = this.findNextPatient();
        this.hideLoading();
        console.log("Success started queue!");

      })
      .catch(error => {
        //error
        this.hideLoading();
        console.log("Failed started queue!");
      });


  }

  private findNextPatient(): BookedPatient {

    const pId: string = this.currentQueue.getCurrentPatient()?.getBookingId() || "";

    for (let i = 0; i < this.currentQueue.getBookings().length; ++i) {
      console.log("searching for candidate..");
      let patient = this.currentQueue.getBookings()[i];

      if (!patient.isPending() && !patient.isProcessed() && pId !== patient.getBookingId()) {
        console.log("Canndidate..mached!");
        return patient;
      }

    }

    return this.findNextPendingPatient();

  }

  private findNextPendingPatient(): BookedPatient {

    for (let i = 0; i < this.currentQueue.getBookings().length; ++i) {
      console.log("searching for pending candidates..");
      let patient = this.currentQueue.getBookings()[i];

      if (patient.isPending() && !patient.isProcessed()) {
        return patient;
      }

    }

    return null;

  }
  navigateToMeeting(currentPatient: BookedPatient): void {

    let data = {
      queue: this.session.getSharedData().queue as QueueModel,
      doctor: this.session.getSharedData().doctor as DoctorUserData,
      currentPatient: currentPatient
    }

    this.session.setSharedData(data);
    this.router.navigate(['doctor/conference']);
  }
  ngOnDestroy(): void {
    if (this.myWaitingTimeTimer) {
      clearInterval(this.myWaitingTimeTimer);
    }
  }
}

