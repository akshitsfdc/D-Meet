import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  minPosition: number
  maxPosition: number
}


@Component({
  selector: 'app-move-patient',
  templateUrl: './move-patient.component.html',
  styleUrls: ['./move-patient.component.css']
})
export class MovePatientComponent{

  dialogData = {canceled: true, defined: false, last: false, position:0}

  positionControl ; 

  constructor(public dialogRef: MatDialogRef<MovePatientComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {

      this.dialogData.position = data.minPosition;

      this.positionControl = new FormControl("Invalid Position", [Validators.max(this.data.maxPosition), Validators.min(this.data.minPosition)]);
    }


    onNoClick(): void {
      this.dialogRef.close(this.dialogData);
    }
    onLastClick(): void{
      this.dialogData.last = true;
      this.dialogData.defined = false;
      this.dialogData.canceled = false;
      this.dialogRef.close(this.dialogData);
    }
    onMoveClick(): void{

      if(this.positionControl.invalid){
          return;
      }
      this.dialogData.last = false;
      this.dialogData.defined = true;
      this.dialogData.canceled = false;

      this.dialogRef.close(this.dialogData);
    }
}
