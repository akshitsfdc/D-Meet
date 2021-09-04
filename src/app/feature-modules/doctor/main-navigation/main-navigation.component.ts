
import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { SessionService } from '../services/session.service';

import * as firebase from 'firebase';
import { DoctorUserData } from '../../common-features/models/doctor-user-data';

@Component({
  selector: 'app-main-navigation',
  templateUrl: './main-navigation.component.html',
  styleUrls: ['./main-navigation.component.scss']
})
export class MainNavigationComponent implements OnInit {


  isExpanded = true;
  notificationCount = 0;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver,
    private authService: AuthService, private router: Router, private route: ActivatedRoute, private session: SessionService) {


  }

  ngOnInit(): void {
    this.liveQueueClick();
  }

  openProfile() {
    this.router.navigate(['doctor-profile'], { relativeTo: this.route });
  }
  liveQueueClick() {
    this.router.navigate(['dashboard'], { relativeTo: this.route });
  }
  queuesClick() {
    this.router.navigate(['queues'], { relativeTo: this.route });
  }
  logOut() {
    this.authService.signOut().then(() => {
      this.router.navigate(['login']);
      this.session.setUserData(new DoctorUserData());
    }).catch(error => {
      console.log('Could not log you out : ' + error);
    });
  }

}
