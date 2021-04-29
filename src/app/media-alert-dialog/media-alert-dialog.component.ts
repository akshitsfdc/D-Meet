import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-media-alert-dialog',
  templateUrl: './media-alert-dialog.component.html',
  styleUrls: ['./media-alert-dialog.component.scss']
})
export class MediaAlertDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<MediaAlertDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

  ngOnInit(): void {
  }

  public close():void {
    this.dialogRef.close();
  }

}
