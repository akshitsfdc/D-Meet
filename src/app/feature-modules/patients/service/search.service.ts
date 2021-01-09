
import { UtilsService } from './../../../services/utils.service';
import { DocumentData } from '@angular/fire/firestore';
import { GeoService } from './../../../services/geo.service';
import { FirestoreService } from './../../../services/firestore.service';
import { SearchedDoctor } from './../models/searched-doctor';
import { Injectable } from '@angular/core';
import { DoctorUserData } from 'src/app/models/doctor-user-data';
import { QueueModel } from 'src/app/models/queue-model';
import { HttpService } from 'src/app/services/http.service';
import { BookedPatient } from 'src/app/models/booked-patient';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  nearbyDoctors:SearchedDoctor[];
  globalDoctors:SearchedDoctor[];

  private globalLastVisible:DocumentData = null;
  private globalDocsLimit:number = 15;

   

  constructor(private firestore:FirestoreService, private utils: UtilsService, private http:HttpService) {
    this.nearbyDoctors = [];
    this.globalDoctors = [];
    this.globalLastVisible = null;
    this.globalDocsLimit = 15;
  }

  public getNearbyDoctors():SearchedDoctor[]{
    return this.nearbyDoctors;
  }

  public getGlobalDoctors():SearchedDoctor[]{
    return this.globalDoctors;
  }
  
  public getGlobalDocsLimit(): number {
  return this.globalDocsLimit;
  }

  public setGlobalDocsLimit(globalDocsLimit: number): void {
      this.globalDocsLimit = globalDocsLimit;
  }

   public loadSearch():void{
    
    // this.firestore.get('userdata');
    
   }
   public loadDoctors():void{
     if(this.globalLastVisible === null){
      this.firestore.getAll('user-data',this.globalDocsLimit).then(snapshots=>{
        if(!snapshots || !snapshots.docs || snapshots.docs.length <= 0){
          return;
        }

        this.globalLastVisible = snapshots.docs[snapshots.docs.length - 1];

        this.setDoctor(this.globalDoctors, snapshots.docs);

      }) 
      .catch(error =>{
        //error
        console.log("error >> "+error);
      });
     }else{
      this.firestore.getAllStartAfter('user-data',this.globalDocsLimit, this.globalLastVisible).then(snapshots=>{

        if(!snapshots || !snapshots.docs || snapshots.docs.length <= 0){
          return;
        }

        this.globalLastVisible = snapshots.docs[snapshots.docs.length - 1];

        this.setDoctor(this.globalDoctors, snapshots.docs);

      }) 
      .catch(error =>{
        //error
        console.log("error >> "+error);
      });
     }     
    
   }
   private setDoctor(doctors:SearchedDoctor[], docs):void{

      docs.forEach(document => {

        let searchedDoctor:SearchedDoctor = new SearchedDoctor();

        searchedDoctor.setQueueInitialized(false);

        let doctor:DoctorUserData = new DoctorUserData();

        Object.assign(doctor, document.data()); 

        searchedDoctor.setDoctor(doctor);

        doctors.push(searchedDoctor);
          
       });
  }

  public setDoctorQueues(searchedDoctor:SearchedDoctor):void{

    let utils:UtilsService = this.utils;
    searchedDoctor.setQueueLoading(true);
    let path:string = 'user-data/'+searchedDoctor.getDoctor().getUserId()+'/queues';
    this.firestore.getRealtimeCollection(path)
    .subscribe({
      next(data){
      
        let queues:QueueModel[] = [];
        data.forEach(element => {
          let queue:QueueModel = new QueueModel();
          Object.assign(queue, element); 
          queues.push(queue);
        });
        searchedDoctor.setQueues(queues);
        utils.changeQueueStatus(queues);
        searchedDoctor.setQueueInitialized(true);
        searchedDoctor.setQueueLoading(false);
     },
     error(msg){
      console.log("Obs error >> : "+msg);
      searchedDoctor.setQueueInitialized(false);
      searchedDoctor.setQueueLoading(false);
     },
     complete: () => console.log('queue loaded!')
   });
  }

  public getBookingsOfQueue(queue: QueueModel) {

    let currentPatient: BookedPatient = new BookedPatient();

    this.http.getServerDate("serverDate")
      .then(dateObj => {

        const millies: number = this.utils.getUtCMillies(dateObj.timestapmIST);        
        const date: Date = new Date(millies);
        const dateStr: string = date.getDate() + '' + date.getMonth() + '' + date.getFullYear();

        this.firestore.getRealTimeCollectionWithQuery("queue-bookings", "doctorId", queue.getOwnerId(), "dateString", dateStr, "queueId", queue.getQueueId(), "bookingTimeServer")
          .subscribe(
            {
              next(patients) {
                
                let bookedPatients: BookedPatient[] = [];              
                patients.forEach(element => {
                  let patient:BookedPatient = new BookedPatient();
                  Object.assign(patient, element); 
                  bookedPatients.push(patient);
                  console.log("I called!")
                  if (patient.isCurrentPatient()) {
                    currentPatient = patient;
                    
                  }
                });
                console.log("I called 2!")
                queue.setCurrentPatient(currentPatient);
                console.log("I called 3!")
                queue.setBookings(bookedPatients);
             },
             error(msg){
              console.log("Obs error >> : "+msg);
             },
             complete: () => console.log('completed')
            });
          });
  }


  
}
