import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-create-account-bottom-sheet',
  templateUrl: './create-account-bottom-sheet.component.html',
  styleUrls: ['./create-account-bottom-sheet.component.css']
})
export class CreateAccountBottomSheetComponent implements OnInit {

  constructor(private router:Router, private _bottomSheetRef: MatBottomSheetRef<CreateAccountBottomSheetComponent>) { }

  ngOnInit(): void {
  }
  openDoctorReg():void{
    this.closeBottomSheet();
    this.router.navigate(['registration']);
  }
  openPatientReg():void{
    this.closeBottomSheet();
    this.router.navigate(['registration-patient']);
  }

  private closeBottomSheet():void{
    this._bottomSheetRef.dismiss();
  }
}
