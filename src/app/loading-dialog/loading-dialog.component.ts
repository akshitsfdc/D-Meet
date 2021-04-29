import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-loading-dialog',
  templateUrl: './loading-dialog.component.html',
  styleUrls: ['./loading-dialog.component.scss']
})
export class LoadingDialogComponent implements OnInit {

  public message: string;
  constructor(public dialogRef: MatDialogRef<LoadingDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,) {

    this.message = data.message as string;
    
   }

  ngOnInit(): void {
  
  }

}
