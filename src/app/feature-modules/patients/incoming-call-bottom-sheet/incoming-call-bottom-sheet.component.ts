import { SessionService } from './../service/session.service';
import { Component, Inject, OnInit } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { CallerModel } from 'src/app/models/caller-model';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-incoming-call-bottom-sheet',
  templateUrl: './incoming-call-bottom-sheet.component.html',
  styleUrls: ['./incoming-call-bottom-sheet.component.scss']
})
  
export class IncomingCallBottomSheetComponent implements OnInit {

  public caller: CallerModel;
  private session: SessionService;
  constructor(private router: Router, private _bottomSheetRef: MatBottomSheetRef<IncomingCallBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public sheetData: any, private firestore: FirestoreService) {
      
    this.caller = this.sheetData.caller;
    this.session = this.sheetData.session;
      
     }

  ngOnInit(): void {
  }

  private closeBottomSheet():void{
    this._bottomSheetRef.dismiss();
  }


  joinConf(videoEnabled:boolean) {
    this.session.endTone();
    this.closeBottomSheet();
    this.session.setSharedData({'videoEnabled':videoEnabled});
    this.navigateToMeeting();
  }
  rejectConf(): void{
    this.session.endTone();
    this.closeBottomSheet();
    this.sendReject();
  }
 navigateToMeeting(): void{
   
  this.session.setSharedData(this.caller); 
    this.router.navigate(['patient/conference']);
 }
  
 private setupRejectObject(): CallerModel {
    
  let caller: CallerModel = new CallerModel();

  caller.setBusy(false);
  caller.setAnswered(false);
  caller.setNewCall(false);
  caller.setReject(true);

  return caller;
  
 }
  
 private sendReject(): void {

  this.firestore.update(this.session.getCallerCollection(), this.session.getUserData().getUserId(), Object.assign({}, this.setupRejectObject()))
    .then(() => {
      
      //this.closeBottomSheet();
    })
    .catch(error => {
      console.log("Error : caller candidates could not be added.");
    });
}
}
