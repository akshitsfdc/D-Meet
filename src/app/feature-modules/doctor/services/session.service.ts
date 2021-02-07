import { queue } from 'rxjs/internal/scheduler/queue';
import { AuthService } from './../../../services/auth.service';
import { UtilsService } from './../../../services/utils.service';
import { Injectable } from '@angular/core';
import { QueueModel } from 'src/app/models/queue-model';
import { DoctorUserData } from 'src/app/models/doctor-user-data';
import { FirestoreService } from 'src/app/services/firestore.service';
import { HttpService } from 'src/app/services/http.service';
import { BookedPatient } from 'src/app/models/booked-patient';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private userData: DoctorUserData;
  private sharedData:any;

  
  private queues:QueueModel[];

  constructor(private utils:UtilsService, private firestore:FirestoreService, private http:HttpService, private authService:AuthService) {
    this.userData = new DoctorUserData();
    this.queues = [];

    this.authService.getUser()
      .then(userData => {
        this.loadDoctorData( userData.uid);
      })
      .catch(error => {
        //error
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


  private loadDoctorData(userId:string):void{

    let currentRef = this;

    this.firestore.getValueChanges('user-data', userId)
    .subscribe(
      
      {
        next(userData){
          let userdata:DoctorUserData = new DoctorUserData();
          Object.assign(userdata, userData); 
          if (currentRef.getUserData() === null) {
            currentRef.setUserData(userdata);
          } else {
            currentRef.updateUserData(userdata);
          }
         
       },
       error(msg){
        console.log("Obs error >> : "+msg);
       },
       complete: () => console.log('completed')
     });

    this.firestore.getQueuesCollection('user-data/' + userId + '/queues')
      .subscribe(docChangeList => {

        docChangeList.forEach(queue => {
        
          let queueObj: QueueModel = new QueueModel();
          
          Object.assign(queueObj, queue.payload.doc.data());

          
          // console.log("patient >>> 123 >> "+JSON.stringify(patient));
          
          switch (queue.payload.type) {
            
            case "added":
              currentRef.getUserData().getQueues().push(queueObj);
              currentRef.changeQueueStatus(queueObj);
              currentRef.loadBookings(queueObj);              
              break;

            case "modified":
              // currentRef.changeQueueStatus(queueObj);
              currentRef.updateQueueOfUser(queueObj);             
              break;
            case "removed":
              currentRef.deleteQueue(queueObj);
              break;
            
          }

        });

      })
  }
  private deleteQueue(queueUpdate: QueueModel): void{
    
    let queues = this.userData.getQueues();

    for (let i = 0; i < queues.length; ++i){
  
      let queue = queues[i];
  
      if (queue.getQueueId() === queueUpdate.getQueueId()) {
  
        this.userData.getQueues().splice(i, 1);
  
        return;
      }
  
    }
  }
  private changeQueueStatus(queue:QueueModel):void{



        if(this.utils.isWithinTimeFrame(queue.getBookingStarting(), queue.getBookingEnding(), 'ist')){
          queue.setStatus('booking');
        }
    
        if(this.utils.isWithinTimeFrame(queue.getConsultingStarting(), queue.getConsultingEnding(), 'ist')){
          queue.setStatus('live');
        }
  
    
        if(this.utils.getTriggerTime(queue.getBookingStarting(), 'ist')){
          setTimeout(() => {
            this.updateQueue(queue);
          }, this.utils.getTriggerTime(queue.getBookingStarting(), 'ist'));
        }
    

        if(this.utils.getTriggerTime(queue.getBookingEnding(), 'ist')){
          setTimeout(() => {
            this.updateQueue(queue);
          }, this.utils.getTriggerTime(queue.getBookingEnding(), 'ist'));
        }
    
    
        if(this.utils.getTriggerTime(queue.getConsultingStarting(), 'ist')){
          setTimeout(() => {
            this.updateQueue(queue);
          }, this.utils.getTriggerTime(queue.getConsultingStarting(), 'ist'));
        }
    
    
        if(this.utils.getTriggerTime(queue.getConsultingEnding(), 'ist')){
          setTimeout(() => {
             this.updateQueue(queue, true);
          }, this.utils.getTriggerTime(queue.getConsultingEnding(), 'ist'));
        }
  }

  private updateQueue(queue:QueueModel, end?:boolean){

    console.log('updateQueue >> ');

    if(end){
      queue.setStatus('scheduled');
      return;
    }
    if(this.utils.isWithinTimeFrame(queue.getBookingStarting(), queue.getBookingEnding(), 'ist')){
      queue.setStatus('booking');
      console.log("status changed to booking.");
    } else {
      queue.setStatus('scheduled');
    }
    if(this.utils.isWithinTimeFrame(queue.getConsultingStarting(), queue.getConsultingEnding(), 'ist')){
      queue.setStatus('live');
      console.log("status changed to live.");
    }

  }


  public loadBookings(queue: QueueModel) {

    let currentRef = this;


    this.http.getServerDate("serverDate")
      
      .then(dateObj => {

        const millies: number = this.utils.getUtCMillies(dateObj.timestapmIST);
        const date: Date = new Date(millies);
        const dateStr: string = date.getDate() + '' + date.getMonth() + '' + date.getFullYear();

        console.log("dateStr : "+dateStr);
      

        this.firestore.getBookingChanges("queue-bookings", "doctorId", queue.getOwnerId(), "dateString", dateStr, "queueId", queue.getQueueId(), "bookingTimeServer")
          .subscribe(docChangeList => {

            docChangeList.forEach(updatedPatient => {
              
              console.log(updatedPatient.payload.doc.data());
              console.log(updatedPatient.payload.type);

              let patient: BookedPatient = new BookedPatient();
              
              Object.assign(patient, updatedPatient.payload.doc.data());

              
              // console.log("patient >>> 123 >> "+JSON.stringify(patient));
              
              switch (updatedPatient.payload.type) {
                
                case "added":
                  patient.setQueuePlace(queue.getBookings().length + 1);
                  if (patient.isCurrentPatient()) {
                    queue.setCurrentPatient(patient);
                  }
                  queue.getBookings().push(patient);
                  currentRef.checkQueueCompleteNess(queue);
                  break;

                case "modified":
                  currentRef.updatePatient(patient, queue);
                  currentRef.checkQueueCompleteNess(queue);
                  break;
                case "removed":
                  break;
                
              }

            });
            currentRef.setCurrentNext(queue);
          })
      });
  }

  private checkQueueCompleteNess(queue: QueueModel) {
  

    for (let i = 0; i < queue.getBookings().length; ++i){

      let patient = queue.getBookings()[i];

      if (!patient.isProcessed()) {
        queue.setQueueEnded(false);
        return;
      }
    }
    queue.setNextNumber("")
    queue.setQueueEnded(true);
  }

  private setCurrentNext(queue:QueueModel) {
    
    for (let i = 0; i < queue.getBookings().length; ++i){

      let patient = queue.getBookings()[i];

      if ((!patient.isCurrentPatient() && !patient.isProcessed())) {
        queue.setNextId(patient.getBookingId());
        queue.setNextNumber("" + patient.getQueuePlace());
        return;
      }

    }
    queue.setNextNumber("");
  }

  private updatePatient(patientUpdate: BookedPatient, queue:QueueModel) {
    

    for (let i = 0; i < queue.getBookings().length; ++i){

      let patient = queue.getBookings()[i];

      if (patientUpdate.getBookingId() === patient.getBookingId()) {

        patient.setName(patientUpdate.getName())
        patient.setPhone(patientUpdate.getPhone());
        patient.setCurrentPatient(patientUpdate.isCurrentPatient());
        patient.setPending(patientUpdate.isPending());
        patient.setProcessed(patientUpdate.isProcessed());
        patient.setPicUrl(patientUpdate.getPicUrl());

        if (patient.isCurrentPatient()) {
          queue.setCurrentPatient(patient);
        }

        return;
      }

    }
   
}
  
private updateQueueOfUser(queueUpdate:QueueModel) {
    
  let queues = this.userData.getQueues();

  for (let i = 0; i < queues.length; ++i){

    let queue = queues[i];

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

  private updateQueueModel(queueOriginal:QueueModel,  queue: QueueModel): void {
    
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

    queueOriginal.setCurrency(queue.getCurrency());
    queueOriginal.setCurrency(queue.getCurrency());
    queueOriginal.setCurrency(queue.getCurrency());
    queueOriginal.setCurrency(queue.getCurrency());
    queueOriginal.setCurrency(queue.getCurrency());
    queueOriginal.setCurrency(queue.getCurrency());
    queueOriginal.setCurrency(queue.getCurrency());
    queueOriginal.setCurrency(queue.getCurrency());
    queueOriginal.setCurrency(queue.getCurrency());
    queueOriginal.setCurrency(queue.getCurrency());

    

  }

}
