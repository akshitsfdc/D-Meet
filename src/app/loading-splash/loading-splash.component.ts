
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

  constructor(private authService: AuthService, private router: Router, private firestore: FirestoreService) { }

  ngOnInit(): void {
    this.checkLogin();
  }

  private async checkLogin(): Promise<void> {

    // tslint:disable-next-line:no-shadowed-variable
    const user: firebase.User = await this.authService.getUser().then(user => user)
      .catch(error => {
        console.log('error occured in getting current user : ' + error);
        return null;
      });
    if (user) {
      this.loadUserData(user);
    } else {
      this.router.navigate(['login']);
    }
  }

  private loadUserData(user: firebase.User): void {

    const userId = user.uid;

    this.firestore.get('users', userId)

      .then(data => {

        const doctor: boolean = data.data().doctor;

        this.authService.isDoctor = doctor;

        if (doctor === null || doctor === undefined) {
          this.authService.signOut().then(() => {
            this.router.navigate(['login']);
          }).catch(() => {
            this.router.navigate(['login']);
          });
          return;
        }
        if (doctor) {
          this.router.navigate(['doctor']);
        } else {
          this.router.navigate(['patient']);
        }

      })
      .catch(error => {
        console.log(error);
        this.authService.signOut().then(() => {
          this.router.navigate(['login']);
        }).catch(() => {
          this.router.navigate(['login']);
        });
      });
  }

}
