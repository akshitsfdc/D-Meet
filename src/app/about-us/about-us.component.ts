import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GetInTouchComponent } from '../get-in-touch/get-in-touch.component';
import { JoinUsComponent } from '../join-us/join-us.component';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class AboutUsComponent implements OnInit {

  public valueAddedCards: string[] = ['Live Queue Management For Doctors', 'Transparent Status Updates For Patients',
    'Manage Your Clinical Data At One Place ', 'Visible And Live Queue Tracking', 'Offline And Online Consultation Support'];
  public leaders: any[] = [];
  constructor(private matDialog: MatDialog, private router: Router) { }

  ngOnInit(): void {
    this.leaders.push({
      name: "Akshit Kumar",
      desg: "Founder and CEO",
      pic: "/assets/imgs/temp_led.jpg"
    });
  }

  public openTerms() {
    this.router.navigate(['terms-and-policies']);
  }

  public openHome() {
    this.router.navigate(['']);
  }

  public openGetInTouch(): void {

    const dialogData = {

    };


    const dialog = this.matDialog.open(GetInTouchComponent, { data: dialogData, disableClose: false });

    dialog.afterClosed().subscribe(result => {

      if (result && !result.canceled) {

      }

    });
  }

  public openJoinUs(): void {

    const dialogData = {

    };


    const dialog = this.matDialog.open(JoinUsComponent, { data: dialogData, disableClose: false });

    dialog.afterClosed().subscribe(result => {

      if (result && !result.canceled) {

      }

    });
  }

}
