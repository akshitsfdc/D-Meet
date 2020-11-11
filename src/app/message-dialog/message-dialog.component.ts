import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  header:string,
  message:string,
  okText:string
}


@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.css']
})
export class MessageDialogComponent implements OnInit {

  
  constructor(public dialogRef: MatDialogRef<MessageDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) { }


  ngOnInit(): void {
  }

  close(){
    this.dialogRef.close();
  }

}
