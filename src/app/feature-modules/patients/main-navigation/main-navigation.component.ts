import { SessionService } from './../service/session.service';
import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-main-navigation',
  templateUrl: './main-navigation.component.html',
  styleUrls: ['./main-navigation.component.scss']
})
export class MainNavigationComponent {


  isExpanded = true;
  notificationCount = 0;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver,
    private authService: AuthService, private router: Router, private route: ActivatedRoute, public session: SessionService) {


    this.gotoHome();
  }

  gotoHome() {
    this.router.navigate(['patient/home']);
  }
  openProfile() {
    // this.router.navigate(['doctor-profile'], { relativeTo: this.route });
  }
  liveQueueClick() {
    // this.router.navigate(['home'], { relativeTo: this.route });
  }
  queuesClick() {
    // MainNavigationComponent
  }
  meetingsClick() {
    this.router.navigate(['patient/meetings']);
  }
  logOut() {
    this.authService.signOut().then(() => {
      this.router.navigate(['login']);

    }).catch(error => {
      console.log('Could not log you out : ' + error);
    });
  }
}
