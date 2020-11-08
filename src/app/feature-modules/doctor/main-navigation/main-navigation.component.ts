import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-main-navigation',
  templateUrl: './main-navigation.component.html',
  styleUrls: ['./main-navigation.component.css']
})
export class MainNavigationComponent {


  isExpanded = true;
  notificationCount:number = 0;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver, private authService: AuthService, private router: Router, private route: ActivatedRoute) { 

    this.liveQueueClick();
  }

  openProfile(){
    this.router.navigate(['doctor-profile'], { relativeTo: this.route });
  }
  liveQueueClick() {
    this.router.navigate(['liveQueue'], { relativeTo: this.route });
  }
  queuesClick(){
    this.router.navigate(['queues'], { relativeTo: this.route });
  }
  logOut(){
    this.authService.signOut().then(() => {
      this.router.navigate(['login']);
    }).catch(error => {
      console.log("Could not log you out : "+error);
    });
  }
}
