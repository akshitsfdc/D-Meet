import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { BookedPatient } from '../models/booked-patient';
import { MovePatientComponent } from '../move-patient/move-patient.component';
@Component({
  selector: 'app-live-queue-details',
  templateUrl: './live-queue-details.component.html',
  styleUrls: ['./live-queue-details.component.css']
})
export class LiveQueueDetailsComponent implements OnInit {

  rippleColor = "#4294f4";
  selectedStatus = "live";
  selectStatusDisplay = "Live";

  disableNext = false;

  tempPatients = []; 
  processedPatients = [];

  consultStarted = true;

  currentPaient: BookedPatient;

  totalPatientSize: Number;


  constructor(private firestore: AngularFirestore, private router: Router, private route: ActivatedRoute, private matDialog: MatDialog) { }

  ngOnInit(): void {
    this.setTestPatients();

    if(this.consultStarted){
      if(this.tempPatients.length > 0){
        this.currentPaient = this.tempPatients.splice(0, 1)[0];
      }  
    }
  }

  goPatientMeet() {
    // this.router.navigate(['patientMeet'], { relativeTo: this.route });
    this.saveData();
  }

  private setTestPatients(){
    for(let i = 0; i < 10; ++i){

       let bookedPatient: BookedPatient = new BookedPatient();

       bookedPatient.name = "Akshit"+i+1 ;
       bookedPatient.picUrl = "Akshit" ;
       bookedPatient.from = "Delhi" ;
       bookedPatient.condition = "Normal" ;
       bookedPatient.queuePlace = i + 1 ;
       bookedPatient.status = "Online";
       bookedPatient.bookingId = "189457733"+i;
       bookedPatient.waitingTime = "47m : 14 sec (at 11:32 AM)";

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

}
