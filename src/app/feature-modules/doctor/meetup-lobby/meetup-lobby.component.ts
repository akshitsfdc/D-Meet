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

  bookingavailable:boolean = false;

  disableNext = false;

  tempPatients = []; 
  processedPatients = [];

  consultStarted = true;

  currentDoctor:DoctorUserData;
  currentPaient: BookedPatient;
  nextPatient: BookedPatient;

  totalPatientSize: Number;
  currentQueue:QueueModel;

  extraheight:number = 75+15+60;
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

  private consultingStartWaitingTime:number = 0;
  private loading: MatDialogRef<LoadingDialogComponent>;

  selftWaitingTime: string = "tun tun";

  userData: PatientUserData;

  constructor(private matDialog: MatDialog,
     public utils:UtilsService, private session:SessionService, private firestoreService: FirestoreService) {

   
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
    this.bookingListElement.nativeElement.style.height = (windowHeight-this.extraheight)+'px'; 
  }

  @HostListener('window:resize', ['$event'])
  onResize(event){
    let windowHeight = window.innerHeight;
    this.bookingListElement.nativeElement.style.height = (windowHeight-this.extraheight)+'px'; 
  }
  initConsultingWaitingTime(){
    setInterval(() => {
      this.consultingStartWaitingTime -= 60000;
      this.consultingStartWaitingTimeLabel = this.utils.getDateDigits(this.consultingStartWaitingTime);
      console.log(this.consultingStartWaitingTimeLabel);
    }, 60000);
  }

  initBookingWaitingTime(){
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

  private setTestPatients(){
    for(let i = 0; i < 10; ++i){

       let bookedPatient: BookedPatient = new BookedPatient();

       bookedPatient.setName("Akshit"+i+1) ;
       bookedPatient.setPicUrl("Akshit");
       bookedPatient.setFrom("Delhi") ;
       bookedPatient.setQueuePlace(i + 1);
       bookedPatient.setStatus(i%2===0?"Online":"Offline");
       bookedPatient.setBookingId("189457733"+i);
       bookedPatient.setPhone("+918888985133");
       bookedPatient.setBookingTime(998883267);

      this.tempPatients.push(bookedPatient);

    }

    this.totalPatientSize = this.tempPatients.length;
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
  movePatient(){

    let dialogData = {
      maxPosition : this.tempPatients.length,
      minPosition : this.tempPatients.length > 2 ? 2 : this.tempPatients.length
    }
    

    let dialog = this.matDialog.open(MovePatientComponent, {data: dialogData});
    
    dialog.afterClosed().subscribe(result => {

      if(result && !result.canceled){
          if(result.defined){
            this.shiftPatientToPosition(result.position);
          }else{
            this.shiftPatientToLast();
          }
      }

      
      
    });
  }

  private shiftPatientToPosition(position: number){

    if(this.tempPatients.length > 0){
      this.tempPatients.splice(position, 0, this.currentPaient);
      this.currentPaient = this.tempPatients.splice(0, 1)[0];
    }
  
  }

  private shiftPatientToLast(){

    if(this.tempPatients.length > 0){
      this.tempPatients.splice( this.tempPatients.length, 0, this.currentPaient);
      this.currentPaient = this.tempPatients.splice(0, 1)[0];
    }
  
    
  }
  statusChanged(){
    switch(this.selectedStatus){
      case "live":{
        this.selectStatusDisplay = "Live";
        break;
      }
      case "offline":{
        this.selectStatusDisplay = "Offline";
        break;
      }
     default:{
      this.selectStatusDisplay = "Away";
       break;
     }
    }
  }

  private saveData(){
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

  

 

private showDialog(type:string, msg:string, ok:string):void{

  let dialogData = {
    type : type,
    message : msg,
    okText: ok
  }

  this.matDialog.open(MessageDialogComponent, {data: dialogData , disableClose: false,
    maxWidth : '300px'
  }).afterClosed().toPromise()
  .then(result => {
    
  });
}
  


  private showLoading() {
    
    this.loading = this.matDialog.open(LoadingDialogComponent,{disableClose:true});

  }
  private hideLoading() {
    this.loading.close();
  }

  bookingAvailability(){
    this.currentQueue.setBookingAvailable(this.utils.isWithinTimeFrame(this.currentQueue.getBookingStarting(), this.currentQueue.getBookingEnding()));
  }
  consultingStarted(){
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

finalizeCurrent(makePending:boolean): void {

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
      let documentString = this.currentQueue.getCurrentPatient().getPatientId() + "_" + this.currentQueue.getCurrentPatient().getBookingId();
      
      this.firestoreService.update("queue-bookings", documentString, serverInput)
        .then(() => {

          this.nextPatient = this.findNextPatient();

          if (this.nextPatient === null) {            
            this.hideLoading();
            console.log("queue ended.");
            this.currentQueue.setCurrentPatient(null);            
            return;            
          }

          
          let documentString = this.nextPatient.getPatientId() + "_" + this.nextPatient.getBookingId();
          
          this.firestoreService.update("queue-bookings", documentString, currentUserInput)
            .then(() => {
              
              // if (pendingStarted) {
              //   this.nextPatient = this.findNextPendingPatient();
              // } else {
              //   this.nextPatient = this.findNextPatient();
              // }
              this.hideLoading();
              console.log("Success.");

            })
            .catch(error => {
              //error
              this.hideLoading();
              console.log("Error making current user.");
            });

        })
        .catch(error => {
        //error
        this.hideLoading();
        console.log("Error updating current user.");
      })
    
   
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
    let patientId = firstPatient.getPatientId();
    let bookingId = firstPatient.getBookingId();

   let documentString = patientId + "_" + bookingId;
   
   console.log("queue started with : "+documentString);
   
          
          this.firestoreService.update("queue-bookings", documentString, currentUserInput)
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

  private findNextPatient():BookedPatient {
    
    // this.currentQueue.getBookings().forEach(patient => {
    //   console.log("searching for candidate..");
      
    //   if (!patient.isPending() && !patient.isProcessed()) {
    //     console.log("Canndidate..mached!");
    //     return patient;
    //   }
    // });

    for (let i = 0; i < this.currentQueue.getBookings().length; ++i){
      console.log("searching for candidate..");
      let patient = this.currentQueue.getBookings()[i];

      if (!patient.isPending() && !patient.isProcessed()) {
        console.log("Canndidate..mached!");
        return patient;
      }

    }

    return this.findNextPendingPatient();

  }
  
  private findNextPendingPatient():BookedPatient {
    
    // this.currentQueue.getBookings().forEach(patient => {
    //   if (patient.isPending() && !patient.isProcessed()) {
    //     return patient;
    //   }
    // });

    for (let i = 0; i < this.currentQueue.getBookings().length; ++i){
      console.log("searching for pending candidates..");
      let patient = this.currentQueue.getBookings()[i];

      if (patient.isPending() && !patient.isProcessed()) {
        return patient;
      }

    }

    return null;

  }
  ngOnDestroy(): void {
    if (this.myWaitingTimeTimer) {
      clearInterval(this.myWaitingTimeTimer);
    }
  }
}

