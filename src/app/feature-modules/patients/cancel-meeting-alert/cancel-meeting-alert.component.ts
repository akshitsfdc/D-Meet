import { UtilsService } from 'src/app/services/utils.service';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-cancel-meeting-alert',
  templateUrl: './cancel-meeting-alert.component.html',
  styleUrls: ['./cancel-meeting-alert.component.scss']
})
export class CancelMeetingAlertComponent implements OnInit {

  public termCheck: boolean = false;

  constructor(public dialogRef: MatDialogRef<CancelMeetingAlertComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private utills:UtilsService) { }

  ngOnInit(): void {
  }

  cancel(){
    this.dialogRef.close({approved: false});
  }
  approve() {
    if (!this.termCheck) {
      this.utills.showMsgSnakebar("Please agree with condition first!");
      return;
    }
    this.dialogRef.close({approved: true});
  }

}
