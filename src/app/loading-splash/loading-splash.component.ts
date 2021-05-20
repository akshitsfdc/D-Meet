
import { FirestoreService } from './../services/firestore.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-loading-splash',
  templateUrl: './loading-splash.component.html',
  styleUrls: ['./loading-splash.component.scss']
})
export class LoadingSplashComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router, private firestore:FirestoreService) { }

  ngOnInit(): void {
    this.checkLogin();
  }

  private async checkLogin() {
    
    const user:firebase.User =  await this.authService.getUser().then(user => {return user;})
    .catch(error => {console.log("error occured in getting current user : "+error)
      return null;
    });

    console.log("user : "+JSON.stringify(user));
    if(user){
      this.loadUserData(user);
    }else{
      this.router.navigate(['login'])
    }
  }

  private loadUserData(user:firebase.User){

    const userId = user.uid;

    this.firestore.get("user-identity", userId)

    .then(data => {

      const doctor:boolean = data.data().doctor;

      if(doctor === null || doctor === undefined){
        this.authService.signOut().then(() => {
          this.router.navigate(['login']);
        }).catch(() => {
          this.router.navigate(['login']);
        })
        return;
      }
      console.log("doctor >> "+doctor);
      if(doctor){      
        this.router.navigate(['doctor']);
      }else{
        this.router.navigate(['patient']);
      }

    })
    .catch(error => {
        console.log(error);
        this.authService.signOut().then(() => {
          this.router.navigate(['login']);
         }).catch(() => {
          this.router.navigate(['login']);
         })
    });
  }  

}
