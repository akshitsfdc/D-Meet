import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-request-refund',
  templateUrl: './request-refund.component.html',
  styleUrls: ['./request-refund.component.scss']
})
export class RequestRefundComponent implements OnInit {

  public termCheck: boolean = false;
  
  constructor(public dialogRef: MatDialogRef<RequestRefundComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private utills:UtilsService) { }

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
