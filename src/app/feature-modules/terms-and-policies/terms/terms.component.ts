import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDrawer, MatSidenav } from '@angular/material/sidenav';
import { GetInTouchComponent } from 'src/app/get-in-touch/get-in-touch.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent implements OnInit {
  [x: string]: any;

  public isExpanded: boolean = false;
  public headerName: string = "Privacy Policy";

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => (result as any).matches),
      shareReplay()
    );
  route: any;


  constructor(private breakpointObserver: BreakpointObserver, private router: Router, private matDialog: MatDialog) { }

  ngOnInit(): void {
    this.openPrivacyPolicy();
  }

  public openPrivacyPolicy(): void {
    this.router.navigate(['terms-and-policies/privacy-policy']);
  }

  public openHome(drawer: MatDrawer) {
    // drawer.toggle();
    this.router.navigate(['']);
  }

  public openGetInTouch(drawer: MatDrawer): void {

    // drawer.toggle();
    const dialogData = {

    };


    const dialog = this.matDialog.open(GetInTouchComponent, { data: dialogData, disableClose: false });

    dialog.afterClosed().subscribe(result => {

      if (result && !result.canceled) {

      }

    });
  }

  public termsAndConditions(drawer: MatDrawer) {
    drawer.toggle();
    this.headerName = "Terms And Conditions";
  }
  public termsPrivacy(drawer: MatDrawer) {
    drawer.toggle();
    this.headerName = "Privacy Policy";
  }
  public refund(drawer: MatDrawer) {
    drawer.toggle();
    this.headerName = "Refund & Cancellation Policy";
  }
  public pricing(drawer: MatDrawer) {
    drawer.toggle();
    this.headerName = "Pricing and Booking Policy";
  }
}
