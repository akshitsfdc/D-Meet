import { PatientUserData } from './../../../models/patient-user-data';

import { SearchService } from './../service/search.service';
import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';
import { SessionService } from '../service/session.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private authService: AuthService, private searchService:SearchService, private session:SessionService, private firestore:FirestoreService) { 
    
  }

  ngOnInit(): void {

    this.authService.getUser().then(user =>{
      this.loadUserData(user.uid);
    })
    .catch(error => {
      //error
    });

    this.loadDoctorData();

    // this.convertToMiliSeconds("13:59");
  }

  // private convertToMiliSeconds(time:string):number{

  //   var seconds = 0;
    
    
  //   try{
  //     var a = time.split(':'); // split it at the colons
  //     let date: Date = new Date();
  //     // date.setHours(+a[0]);
  //     // date.setMinutes(+a[1]);
  
  //     console.log("milliseconds : "+date.getTime());
  //     console.log("hours : " + date.getHours());
  //     console.log("minutes : " + date.getMinutes());
  //     console.log("date : " + date.getDate());
  //     console.log("month : " + date.getMonth());
  //     console.log("year : "+date.getFullYear());
  //     // minutes are worth 60 seconds. Hours are worth 60 minutes.
  //    seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60;// + (+a[2]); 
  //   }catch{
  //     seconds = 0;
  //   }

  //   let date: Date = new Date(seconds);
  //   date.setHours(+a[0]);
  //   date.setMinutes(+a[1]);

  //   console.log("milliseconds : "+date.getTime());
  //   console.log("hours : " + date.getHours());
  //   console.log("minutes : " + date.getMinutes());
  //   console.log("date : " + date.getDate());
  //   console.log("month : " + date.getMonth());
  //   console.log("year : "+date.getFullYear());
  //   return  seconds * 1000;
  // }

  private loadDoctorData():void{

    this.searchService.loadDoctors();
    
  }

  private loadUserData(userId:string):void{

    let session:SessionService = this.session;

    this.firestore.getValueChanges('user-data-patient', userId)
    .subscribe(
      
      {
        next(userData){
          let userdata:PatientUserData = new PatientUserData();
          Object.assign(userdata, userData); 
          session.setUserData(userdata);
       },
       error(msg){
        console.log("Obs error >> : "+msg);
       },
       complete: () => console.log('completed')
      });
  }

}
