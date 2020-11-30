import { SessionService } from './../services/session.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { DoctorUserData } from '../models/doctor-user-data';
import { QueueModel } from '../models/queue-model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router, private sessionService:SessionService, private firestore:FirestoreService) {
    console.log(sessionService);
  }

  ngOnInit(): void {

    this.authService.getUser().then(user =>{
      this.loadDoctorData(user.uid);
    })
    .catch(error => {
      //error
    });

  }

  logout() {
    this.authService.signOut()
      .then(result => {
        console.log(result)
        this.router.navigate(['']);
      })
      .catch(error => console.log(error));

      
  }


  private loadDoctorData(userId:string):void{

    let session:SessionService = this.sessionService;

    this.firestore.getValueChanges('user-data', userId)
    .subscribe(
      
      {
        next(userData){
          let userdata:DoctorUserData = new DoctorUserData();
          Object.assign(userdata, userData); 
          session.setUserData(userdata);
          console.log("testing user : >> ",JSON.stringify(session.getUserData()));
       },
       error(msg){
        console.log("Obs error >> : "+msg);
       },
       complete: () => console.log('completed')
     });

    this.firestore.getRealtimeCollection('user-data/'+userId+'/queues')
    .subscribe({
      next(data){
        let queues:QueueModel[] = [];
        data.forEach(element => {
          let queue:QueueModel = new QueueModel();
          Object.assign(queue, element); 
          queues.push(queue);
        });
        session.setQueues(queues);
        console.log("Obs next >> : "+JSON.stringify(session.getQueues()));
     },
     error(msg){
      console.log("Obs error >> : "+msg);
     },
     complete: () => console.log('completed')
   });

  }

}
