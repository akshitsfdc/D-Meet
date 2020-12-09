import { UtilsService } from './../../../services/utils.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, NgForm } from '@angular/forms';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { QueueModel } from '../models/queue-model';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-edit-queue',
  templateUrl: './edit-queue.component.html',
  styleUrls: ['./edit-queue.component.scss']
})
export class EditQueueComponent implements OnInit {

  currentQueue:QueueModel;

  bookEndMin = null;
  consultEndMin = null;

  enableBookEnd = false;
  enableConsultingEnd = false;

  bookStartTime = "";
  bookEndTime = "";
  consultingStartTime = "";
  consultingEndTime = "";

  slectedCurrency = "INR";

  feeStructureText:string = "";
  serviceChargePercent:number = 5;
  defaultFees = 300;

  private currentUser:string;

  disableSubmit:boolean = false;
  showProgressBar = false;

  queueForm:FormGroup;

  darkTheme: NgxMaterialTimepickerTheme = {
    container: {
        bodyBackgroundColor: '#424242',
        buttonColor: '#fff'
    },
    dial: {
        dialBackgroundColor: '#555',
    },
    clockFace: {
        clockFaceBackgroundColor: '#555',
        clockHandColor: '#0F9D58',
        clockFaceTimeInactiveColor: '#fff'
    }
};

workings = [];

holidays = [];

  constructor(private authService: AuthService, private firestore: FirestoreService, private router: Router, 
    private route: ActivatedRoute,  private matDialog: MatDialog, public session:SessionService, public util:UtilsService) {

   this.currentQueue = session.getSharedData() as QueueModel;
     
   }

   drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
  }

  //  async getUserdata(){
  //   this.currentUser = await this.authService.getUser();
  // }

ngOnInit():void{

    this.queueForm = new FormGroup({
      'first' : new FormGroup({
        numberOfPatients: new FormControl(250, Validators.required),
        currency: new FormControl(this.slectedCurrency, Validators.required),
        fees: new FormControl(this.defaultFees, Validators.required),
        aTimePerPatient : new FormControl(7, [Validators.required, Validators.max(30), Validators.min(1)])
      }),
      'second' : new FormGroup({
        bStartTime: new FormControl(this.util.get24Time(this.currentQueue.getBookingStarting()), Validators.required),
        bEndTime: new FormControl(this.util.get24Time(this.currentQueue.getBookingEnding()), Validators.required),
        cStartTime: new FormControl(this.util.get24Time(this.currentQueue.getConsultingStarting()), Validators.required),
        cEndTime: new FormControl(this.util.get24Time(this.currentQueue.getConsultingEnding()), Validators.required)
      })
      
  });

  this.slectedCurrency = this.currentQueue.getCurrency();
  this.defaultFees = this.currentQueue.getFees();

  this.holidays = this.currentQueue.getHolidayList();
  this.workings = this.util.getWorkingDays(this.holidays);

  this.timeChangeBookStart(this.util.get24Time(this.currentQueue.getBookingStarting()));
  this.timeChangeBookEnd(this.util.get24Time(this.currentQueue.getBookingEnding()));
  this.timeChangeConsultStart(this.util.get24Time(this.currentQueue.getConsultingStarting()));
  this.timeChangeConsultEnd(this.util.get24Time(this.currentQueue.getConsultingEnding()));

  this.setFeeStructureText(this.defaultFees);

  this.currentUser = this.session.getUserData().getUserId();

}

  timeChangeBookStart(time){


    
    this.bookStartTime = time;

    this.bookEndMin = time;

    this.enableBookEnd = true;

    this.convertToMiliSeconds(this.bookEndMin);

    this.bookEndTime = "";
    this.consultingStartTime = "";
    this.consultingEndTime = "";
  }

  timeChangeBookEnd(time){
    this.bookEndTime = time;
  }
  
  timeChangeConsultStart(time){

    this.consultingStartTime = time;

    this.consultEndMin = time;

    this.enableConsultingEnd = true;

    this.consultingEndTime = "";

  }
  timeChangeConsultEnd(time){
    this.consultingEndTime = time;
  }
  private convertToMiliSeconds(time:string):number{

    var seconds = 0;
    try{
      var a = time.split(':'); // split it at the colons

      // minutes are worth 60 seconds. Hours are worth 60 minutes.
     seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60;// + (+a[2]); 
    }catch{
      seconds = 0;
    }
    

    return  seconds * 1000;
  }
  private validateForm(): boolean{

    let valid:boolean = true;

    
    try{
      let bookingStartTime = this.convertToMiliSeconds(this.bookStartTime); 
      let bookingEndTime = this.convertToMiliSeconds(this.bookEndTime); 
      let consultingStartTime = this.convertToMiliSeconds(this.consultingStartTime); 
      let consultingEndTime = this.convertToMiliSeconds(this.consultingEndTime); 

      if(this.numberOfPatients.value.length <= 0){
        valid = false;
      }
      if(this.currency.value.length <= 0){
        valid = false;
      }
      if(this.fees.value.length <= 0){
        valid = false;
      }
      if(this.aTimePerPatient.value.length <= 0){
        valid = false;
      }
      
      if(bookingEndTime <= bookingStartTime){
        alert("Booking end time can not be less than or equal to booking start time");
        valid = false;
      }
      if(consultingStartTime < bookingStartTime){
        alert("Consulting start time can not be less than or equal to booking start time");
        valid = false;
      }
      if(consultingEndTime <= consultingStartTime){
        alert("Consulting end time can not be less than or equal to Consulting start time");
        valid = false;
      }
      
    }catch{
      alert("It seems that you might have given some invalid input, please check all your fields again!");
      valid = false;
    }
    
    return valid;
  }

  get firstForm() {
    return this.queueForm.get('first');
  }
  get secondForm() {
    return this.queueForm.get('second');
  }
  get numberOfPatients() {
    return this.queueForm.get('first').get('numberOfPatients');
  }
  get currency() {
    return this.queueForm.get('first').get('currency');
  }
  get fees() {
    return this.queueForm.get('first').get('fees');
  }
  get aTimePerPatient() {
    return this.queueForm.get('first').get('aTimePerPatient');
  }
  get bStartTime() {
    return this.queueForm.get('second').get('bStartTime');
  }
  get bEndTime() {
    return this.queueForm.get('second').get('bEndTime');
  }
  get cStartTime() {
    return this.queueForm.get('second').get('cStartTime');
  }
  get cEndTime() {
    return this.queueForm.get('second').get('cEndTime');
  }
  

  onSubmit(queueForm: NgForm) {
    if(!this.validateForm()){
      return;
    }
    if(queueForm.valid){
      this.constructQueueObject();
      this.saveQueue(this.constructQueueObject());
    }
   

  }

  private setFeeStructureText(fees: number):void{

    // console.log("this.currency : "+JSON.stringify(this.currency.value));
    let serviceCharge:number = (fees/100) * this.serviceChargePercent;
    let totalFees:number = Number(fees) + Number(serviceCharge);
    this.feeStructureText = "*Service Charge = "+serviceCharge+" "+ this.currency.value+",  You will be paid = "+fees+" "+ this.currency.value+", Total Payable for patient = "+totalFees.toString()+" "+ this.currency.value;
  }
  
  onFeesChangedEvent(event:any):void{
    let value = event.target.value;
    if(isNaN(value)){
      alert("Invalid fees provided! Please provide a valid number.");
      return;
    }
    this.setFeeStructureText(value)
  }
  private constructQueueObject(): QueueModel{

    if(!this.currentUser){
      alert("You seems to be logged out because of some reason, please login again or wait for some time or try to refresh this page!");
      return;
    }
    let bookingStartTime = this.convertToMiliSeconds(this.bookStartTime); 
    let bookingEndTime = this.convertToMiliSeconds(this.bookEndTime); 
    let consultingStartTime = this.convertToMiliSeconds(this.consultingStartTime); 
    let consultingEndTime = this.convertToMiliSeconds(this.consultingEndTime); 

    let queue : QueueModel = new QueueModel();

      queue.setStatus("Active");
      queue.setQueueId(this.currentQueue.getQueueId());
      queue.setPatientLimit(this.numberOfPatients.value) ;
      queue.setActive(true);
      queue.setOwnerId(this.currentUser); //to be changed
      queue.setFees(this.fees.value); 
      queue.setBookingStarting(bookingStartTime);
      queue.setBookingEnding(bookingEndTime);
      queue.setConsultingStarting(consultingStartTime);
      queue.setConsultingEnding(consultingEndTime);
      queue.setBookedPatients(0);
      queue.setHolidayList(this.holidays);
      
      console.log(JSON.stringify(queue));
      return queue;
  }

  private getTimestamp():string{

    try{
      return (new Date().getTime()).toString();
    }catch{
      return "invalid";
    }
    
  }

  private saveQueue(queue : QueueModel){
    
    this.showProgress();
    this.firestore.update("user-data/"+this.currentUser+"/queues", queue.getQueueId(), Object.assign({}, queue))
    .then(() => {
      this.hideProgress();
      this.showMessageDialog('success', "Your queue has been updated and activated now patients can book online/offline appointments in this queue as per timings provided by you!", "Close");  
     
    })
    .catch(error => {
      this.hideProgress();
      this.showMessageDialog('fail', "Could not update queue at this moment please try again. If you keep getting this error, please contact support at support@doctormeetup.com", "Close");  
    
    })

  }

  private showMessageDialog(type:string, msg:string, ok:string):void{

    let dialogData = {
      type : type,
      message : msg,
      okText: ok
    }

    this.matDialog.open(MessageDialogComponent, {data: dialogData , disableClose: false,
      maxWidth : '300px'
    }).afterClosed().toPromise().then(result => {
      console.log("Dialoge closed!");
      this.router.navigate(['doctor/queues']);
    });
  }

  private showProgress(){
    this.disableSubmit = true;
    this.showProgressBar = true;
  
  }

  private hideProgress(){
    this.disableSubmit = false;
    this.showProgressBar = false;
  
  }
}
