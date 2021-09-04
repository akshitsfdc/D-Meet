
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { DoctorUserData } from '../../common-features/models/doctor-user-data';
import { KYCModel } from '../models/kyc-model';
import { ProfileEditComponent } from '../profile-edit/profile-edit.component';
declare var google: any;

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.css']
})
export class DoctorProfileComponent implements OnInit {


  private currentUser: firebase.default.User;
  currentUserData: DoctorUserData = new DoctorUserData();
  paymentData: KYCModel = new KYCModel();

  verifiedText = "Verified Doctor";

  constructor(private auth: AuthService, private firestore: FirestoreService, private matDialog: MatDialog) { }

  ngOnInit(): void {

    this.setCurrentUserData();
    this.loadPaymentData();

    navigator.geolocation.getCurrentPosition(position => {
      console.log(position);//JSON.stringify(position));
    })

    //this.getGeoFromAddress();
  }

  private setCurrentUserData() {

    this.getCurrentUser();


  }
  private async getCurrentUser() {
    return await this.auth.getUser()
      .then(user => {
        this.currentUser = user;

        this.firestore.getValueChanges("user-data", this.currentUser.uid)
          .subscribe(snapshot => {

            if (snapshot) {
              console.log("User Data Subscription called! ");
              Object.assign(this.currentUserData, snapshot);
            }
          });
      })
      .catch(error => { console.log(error) });
  }
  private async loadPaymentData() {
    return await this.auth.getUser()
      .then(user => {
        this.currentUser = user;

        this.firestore.getValueChanges("kyc", this.currentUser.uid)
          .subscribe(snapshot => {

            if (snapshot) {
              console.log("payment subscription called! ");
              Object.assign(this.paymentData, snapshot);
            }
          });
      })
      .catch(error => { console.log(error) });
  }
  openFacilityUpdate() {

    let dialogData = {
      type: "facility",
      userData: this.currentUserData
    }


    let dialog = this.matDialog.open(ProfileEditComponent, { data: dialogData, disableClose: false });

    dialog.afterClosed().subscribe(result => {

      if (result && !result.canceled) {

      }



    });
  }
  openAboutUpdate() {

    let dialogData = {
      type: "about",
      userData: this.currentUserData
    }


    let dialog = this.matDialog.open(ProfileEditComponent, {
      data: dialogData, disableClose: false,
      minWidth: '600px'
    });

    dialog.afterClosed().subscribe(result => {

      if (result && !result.canceled) {

      }
    });
  }

  openPPUpdate() {

    let dialogData = {
      type: "pp",
      userData: this.currentUserData
    }


    let dialog = this.matDialog.open(ProfileEditComponent, { data: dialogData, disableClose: false });

    dialog.afterClosed().subscribe(result => {

      if (result && !result.canceled) {

      }



    });
  }
  openDiseasesUpdate() {

    let dialogData = {
      type: "disease",
      userData: this.currentUserData
    }


    let dialog = this.matDialog.open(ProfileEditComponent, {
      data: dialogData, disableClose: false,
      minWidth: '50%',
      maxWidth: '95%'
    });

    dialog.afterClosed().subscribe(result => {

      if (result && !result.canceled) {

      }
    });
  }

  openBankUpdate() {

    let dialogData = {
      type: "bank",
      userData: this.currentUserData
    }


    let dialog = this.matDialog.open(ProfileEditComponent, {
      data: dialogData, disableClose: false,
      minWidth: '50%',
      maxWidth: '95%'
    });

    dialog.afterClosed().subscribe(result => {

      if (result && !result.canceled) {

      }
    });
  }

  openProfilePicChange() {

    let dialogData = {
      type: "profilePicChange",
      userData: this.currentUserData
    }


    let dialog = this.matDialog.open(ProfileEditComponent, {
      data: dialogData, disableClose: false,
      minWidth: '50%',
      maxWidth: '95%'
    });

    dialog.afterClosed().subscribe(result => {

      if (result && !result.canceled) {

      }
    });
  }

}
  // getGeoFromAddress(){
  //     let geocoder = new google.maps.Geocoder();
  //     geocoder.geocode()
  //     geocoder.geocode({
  //       'address': "h. no. 496 awas vikas colony bijnor."
  //   }, (results) => {

  //       if (status == google.maps.GeocoderStatus.OK) {
  //         console.log("status : "+" result : "+results[0].geometry.location);
  //       } else {
  //           console.log('Error: ', results, ' & Status: ', status);         
  //       }
  //   });
  // }


