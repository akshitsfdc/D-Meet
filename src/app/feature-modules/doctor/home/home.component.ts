import { SessionService } from './../services/session.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { DoctorUserData } from 'src/app/models/doctor-user-data';
import { QueueModel } from 'src/app/models/queue-model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private session:SessionService) {
    this.session.initSession();
  }

  
  ngOnInit(): void {

    // this.authService.getUser().then(user =>{
    //   this.loadDoctorData(user.uid);
    // })
    // .catch(error => {
    //   //error
    // });

  }


  // private loadDoctorData(userId:string):void{

  //   let session:SessionService = this.sessionService;

  //   this.firestore.getValueChanges('user-data', userId)
  //   .subscribe(
      
  //     {
  //       next(userData){
  //         let userdata:DoctorUserData = new DoctorUserData();
  //         Object.assign(userdata, userData); 
  //         session.setUserData(userdata);
  //      },
  //      error(msg){
  //       console.log("Obs error >> : "+msg);
  //      },
  //      complete: () => console.log('completed')
  //    });

  //   this.firestore.getRealtimeCollection('user-data/'+userId+'/queues')
  //   .subscribe({
  //     next(data){
  //       let queues:QueueModel[] = [];
  //       data.forEach(element => {
  //         let queue:QueueModel = new QueueModel();
  //         Object.assign(queue, element); 
  //         queues.push(queue);
          
  //       });
  //       session.setQueues(queues);
  //    },
  //    error(msg){
  //     console.log("Obs error >> : "+msg);
  //    },
  //    complete: () => console.log('completed')
  //  });

  // }

}
