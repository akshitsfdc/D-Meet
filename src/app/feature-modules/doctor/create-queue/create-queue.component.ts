import { Component} from '@angular/core';
import { FormGroup, FormControl, Validators, NgForm } from '@angular/forms';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { QueueModel } from '../models/queue-model';

@Component({
  selector: 'app-create-queue',
  templateUrl: './create-queue.component.html',
  styleUrls: ['./create-queue.component.css']
})
export class CreateQueueComponent {

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

  private currentUser: firebase.User;

  queueForm = new FormGroup({
    numberOfPatients: new FormControl(250, Validators.required),
    currency: new FormControl(this.slectedCurrency, Validators.required),
    fees: new FormControl(this.defaultFees, Validators.required),
    bStartTime: new FormControl('', Validators.required),
    bEndTime: new FormControl('', Validators.required),
    cStartTime: new FormControl('', Validators.required),
    cEndTime: new FormControl('', Validators.required),
    aTimePerPatient : new FormControl(7, Validators.required)
  });

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

  constructor(private authService: AuthService, private firestore: FirestoreService, private router: Router, private route: ActivatedRoute) {

    this.setFeeStructureText(this.defaultFees);
    this.getUserdata();

   }

   async getUserdata(){
    this.currentUser = await this.authService.getUser();
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
    

    return seconds * 1000;
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

  get numberOfPatients() {
    return this.queueForm.get('numberOfPatients');
  }
  get currency() {
    return this.queueForm.get('currency');
  }
  get fees() {
    return this.queueForm.get('fees');
  }
  get bStartTime() {
    return this.queueForm.get('bStartTime');
  }
  get bEndTime() {
    return this.queueForm.get('bEndTime');
  }
  get cStartTime() {
    return this.queueForm.get('cStartTime');
  }
  get cEndTime() {
    return this.queueForm.get('cEndTime');
  }
  get aTimePerPatient() {
    return this.queueForm.get('aTimePerPatient');
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

    console.log("this.currency : "+JSON.stringify(this.currency.value));
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

      queue.setStatus("Created");
      queue.setQueueId(this.getTimestamp());
      queue.setPatientLimit(this.numberOfPatients.value) ;
      queue.setOwnerId(this.currentUser.uid); //to be changed
      queue.setFees(this.fees.value); 
      queue.setBookingStarting(bookingStartTime);
      queue.setBookingEnding(bookingEndTime);
      queue.setConsultingStarting(consultingStartTime);
      queue.setConsultingEnding(consultingEndTime);
      queue.setBookedPatients(0);

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

    this.firestore.save("queues", this.currentUser.uid, Object.assign({}, queue))
    .then(() => {
      this.router.navigate(['home/queues']);
      console.log("queue saved!");
    })
    .catch(error => {
      console.log("Could not save queue.");
    })

  }

}
