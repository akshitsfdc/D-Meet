import { SearchService } from './../service/search.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { PaymentInfo } from '../../../models/payment-info';
import { PatientUserData } from './../../../models/patient-user-data';
import { BookingDialogComponent } from './../booking-dialog/booking-dialog.component';
import { CheckoutService } from './../service/checkout.service';
import { DoctorUserData } from './../../../models/doctor-user-data';
import { HttpService } from './../../../services/http.service';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UtilsService } from 'src/app/services/utils.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { MovePatientComponent } from '../../doctor/move-patient/move-patient.component';
import { QueueModel } from 'src/app/models/queue-model';
import { SessionService } from '../service/session.service';
import { LoadingDialogComponent } from 'src/app/loading-dialog/loading-dialog.component';
import { BookedPatient } from '../../../models/booked-patient';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';

declare var Razorpay: any; 

@Component({
  selector: 'app-meetup-lobby',
  templateUrl: './meetup-lobby.component.html',
  styleUrls: ['./meetup-lobby.component.scss']
})
export class MeetupLobbyComponent implements OnInit {

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

  totalPatientSize: Number;
  currentQueue:QueueModel;

  extraheight:number = 75+15+60;
  totalTimePassed:string = "0h:00m"
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
  upcomingPatient = [
    'Episode I - The Phantom Menace',
    'Episode II - Attack of the Clones',
    'Episode III - Revenge of the Sith',
    'Episode IV - A New Hope',
  ];

  private timepassedMillis:number = 0;
  private loading: MatDialogRef<LoadingDialogComponent>;

  userData: PatientUserData;

  constructor(private matDialog: MatDialog,
     public util:UtilsService, private httpService:HttpService, private session:SessionService, public utils:UtilsService,
     private checkoutService:CheckoutService, private firestore:FirestoreService, private searchService:SearchService) {

   
  }

  
  ngOnInit(): void {

   
    this.currentQueue = this.session.getSharedData().queue;
    this.currentDoctor = this.session.getSharedData().doctor;
    this.userData = this.session.getUserData(); 

    this.searchService.getBookingsOfQueue(this.currentQueue);


    this.bookingAvailability();
    this.consultingStarted();

    this.setTimerForAvailability();

    if (this.currentQueue.isBookingAvailable() && !this.currentQueue.isConsultingStarted()) {

      this.timepassedMillis = this.util.getTimeDifference(this.currentQueue.getConsultingStarting());

      this.totalTimePassed = this.util.getDateDigits(this.timepassedMillis);//this.util.getDateDigits(this.util.getTimeDifference(this.currentQueue.getConsultingStarting()));
  
      this.initTimePassed();
    }
   

    this.setTestPatients();

    // if(this.consultStarted){
    //   if(this.tempPatients.length > 0){
    //     this.currentPaient = this.tempPatients.splice(0, 1)[0];
    //   }  
    // }

    this.httpService.getServerDate('serverDate')
    .then(response => {
      console.log(JSON.stringify(response));
    })
    .catch(error=>{
      //error
      console.log(error);
    });
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
  initTimePassed(){
    setInterval(() => {
      this.timepassedMillis += 60000;
      this.totalTimePassed = this.util.getDateDigits(this.timepassedMillis);//this.util.getDateDigits(this.util.getTimeDifference(this.currentQueue.getConsultingStarting()));
      console.log(this.totalTimePassed);
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


  nextPatient(){

    this.processedPatients.push(this.currentPaient);

    if(this.tempPatients.length > 0){
      this.currentPaient = this.tempPatients.splice(0, 1)[0];
    }
    
    if(this.processedPatients.length === this.totalPatientSize){
      // this.processedPatients.push(this.currentPaient);
      // this.currentPaient = this.tempPatients.splice(0, 1)[0];
      this.disableNext = true;
    }
    
  }
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

  private getCitydata():any{

    return {

      "type":"degree",

      "degrees" :[
        "MBBS – Bachelor of Medicine, Bachelor of Surgery",
        
        "BDS – Bachelor of Dental Surgery",
        
        "BAMS – Bachelor of Ayurvedic Medicine and Surgery",
        
        "BUMS – Bachelor of Unani Medicine and Surgery",
        
        "BHMS – Bachelor of Homeopathy Medicine and Surgery",
        
        "BYNS- Bachelor of Yoga and Naturopathy Sciences",
        
        "B.V.Sc & AH- Bachelor of Veterinary Sciences and Animal Husbandry",
        
        "Bachelor of Occupational Therapy",
        
        "Bachelor of Science in Biotechnology",
        
        "Bachelor of Technology in Biomedical Engineering",
        
        "Bachelor of Science in Microbiology (Non-Clinical)",
        
        "Bachelor of Science in Cardiac or Cardiovascular Technology",
        
        "Bachelor of Perfusion Technology or Bachelor of Science in Cardio-Pulmonary Perfusion Technology",
        
        "Bachelor of Respiratory Therapy",
        
        "Bachelor of Science in Nutrition and Dietetics",
        
        "Bachelor of Science in Genetics",
        
        "Doctor of Medicine (MD)",
        
        "Masters of Surgery (MS)",
        
        "Diplomate of National Board (DNB)",
        
        "Other"
        
        ]
   }
}

private async bookNow(phoneNumber:string, from:string):Promise<void>{

  this.showLoading();

  await this.util.originalBookingCheck(this.currentQueue.getBookingStarting(), this.currentQueue.getBookingEnding())
    .then(result => {
      console.log( result );
    })
    .catch(error => {
    //error
  })
 
  if (!(await this.util.originalBookingCheck(this.currentQueue.getBookingStarting(), this.currentQueue.getBookingEnding()))) {
    
    this.showDialog('fail', "This queue is no longer available for booking today. Please check your system date and time, in case you got any false availability of this queue. Or contact support if you have any further issue.", "Ok");
    this.hideLoading();
    return;
  } 
  let checkoutobject:any = this.checkoutService.getPaymentOptionObject();
  checkoutobject.amount = this.currentQueue.getFees() * 100;
  checkoutobject.currency = "INR";
  checkoutobject.name = this.currentDoctor.getFirstName()+' '+this.currentDoctor.getLastName()+' - Appointment';

  checkoutobject.prefill.name = this.userData.getFirstName()+' '+this.userData.getLastName();
  checkoutobject.prefill.email = this.userData.getEmail();
  checkoutobject.prefill.contact = phoneNumber;

  checkoutobject['handler'] =  (response)=>{
    this.processPaymentSuccess(phoneNumber, from , response)
  };
  this.getOrderId().then(data => {
    if(data && data.status === "success"){
      let order:any = data.order;
      checkoutobject.order_id = order.id;      

      this.hideLoading();

      this.checkout(checkoutobject);

      
    }else{
      console.log("Got error resonse !");
      this.hideLoading();
    }
  })
  .catch(error =>{
    //error
    console.log("error : " + JSON.stringify(error));
    this.hideLoading();

  });

  
}

private  getOrderId(){
  return  this.checkoutService.createOrderId((this.currentQueue.getFees() * 100).toString(), "INR")
}

private checkout(options):void{

  let rzp1 = new Razorpay(options);

  rzp1.on('payment.failed', (response) => {
    this.processPaymentError(response);
  });

  rzp1.open();
  
}

private processPaymentSuccess(phoneNumber, from, response){
  
  // let paymentInfo: PaymentInfo = new PaymentInfo();
  // paymentInfo.setPaymentId(response.razorpay_payment_id || "");
  // paymentInfo.setOrderId(response.razorpay_order_id || "");
  // paymentInfo.setSignature(response.razorpay_signature || "");

  let bookedPaitient: BookedPatient = new BookedPatient();

  const name:string = this.userData.getFirstName() + ' ' + this.userData.getLastName()
  bookedPaitient.setName(name);
  bookedPaitient.setPicUrl(this.userData.getPicUrl());
  bookedPaitient.setAge(this.userData.getAge());
  bookedPaitient.setFrom(from);
  bookedPaitient.setPhone(phoneNumber);
  bookedPaitient.setStatus("online");
  bookedPaitient.setQueuePlace(10);
  bookedPaitient.setBookingTime(+Date.now());
  bookedPaitient.setBookingId((+Date.now()).toString());
  bookedPaitient.setQueueId(this.currentQueue.getQueueId());
  bookedPaitient.setDoctorId(this.currentDoctor.getUserId());
  // bookedPaitient.setPaymentInfo(paymentInfo);
  bookedPaitient.setPaymentId(response.razorpay_payment_id || "");
  bookedPaitient.setOrderId(response.razorpay_order_id || "");
  bookedPaitient.setSignature(response.razorpay_signature || "");
  bookedPaitient.setPatientId(this.userData.getUserId());
  bookedPaitient.setCurrentPatient(false);

  let date: Date = new Date();
  let dateStr = date.getDay() + '' + date.getMonth() + '' + date.getFullYear();
  bookedPaitient.setDateString(dateStr);

  const docId = this.userData.getUserId() + "_" + Date.now();
  

  this.showLoading();
  this.firestore.save("queue-bookings", docId, Object.assign({}, bookedPaitient))
  .then(() => {
    this.showDialog('success', "Your appointment has been registered successfully. You can now track your booking on this lobby.", "Ok")
    this.hideLoading();
  })
  .catch(error => {
    this.showDialog('fail', "Something went wrong. We could not book your appointment at this time. Please contact support, if you have any query", "Ok");
    console.log("failed : "+error);
    this.hideLoading();
  });
 
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
  
  
private processPaymentError(response){
  console.log("payment Failed : "+JSON.stringify(response));
}
  
 
  private saveMyBooking() {
    // this.firestore.save('queue-bookings');
  }


  openBookingDialog(){

    let dialogData = {
      maxPosition : this.tempPatients.length,
      minPosition: this.tempPatients.length > 2 ? 2 : this.tempPatients.length
    }
    

    let dialog = this.matDialog.open(BookingDialogComponent, { minWidth:"300px", maxWidth:"500px", maxHeight:"600px", disableClose:true, data: dialogData});
    
    dialog.afterClosed().subscribe(result => {

      if (result && !result.canceled) {
       
          if(result.paying){           
            this.bookNow(result.phoneNumber, result.city);
          }else{
            // this.hideLoading();
          }
      }

      
      
    });
  }

  private showLoading() {
    
    this.loading = this.matDialog.open(LoadingDialogComponent,{disableClose:true});

  }
  private hideLoading() {
    this.loading.close();
  }

  bookingAvailability(){
    this.currentQueue.setBookingAvailable(this.util.isWithinTimeFrame(this.currentQueue.getBookingStarting(), this.currentQueue.getBookingEnding()));
  }
  consultingStarted(){
    this.currentQueue.setConsultingStarted(this.util.isWithinTimeFrame(this.currentQueue.getConsultingStarting(), this.currentQueue.getConsultingEnding()));
  }
}
