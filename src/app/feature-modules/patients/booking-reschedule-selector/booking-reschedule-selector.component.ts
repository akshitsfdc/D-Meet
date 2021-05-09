import { UtilsService } from './../../../services/utils.service';
import { FormControl, FormControlName, FormGroup, Validators } from '@angular/forms';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-booking-reschedule-selector',
  templateUrl: './booking-reschedule-selector.component.html',
  styleUrls: ['./booking-reschedule-selector.component.scss']
})
export class BookingRescheduleSelectorComponent implements OnInit {

  public minDate: Date;
  public dateForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<BookingRescheduleSelectorComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private utills:UtilsService)
  { }

  ngOnInit(): void {
    let currentMillis = this.data.currentDate;
    this.minDate = new Date(currentMillis);
    this.minDate.setDate(this.minDate.getDate() + 1);

    this.dateForm = new FormGroup({
      picker: new FormControl('', Validators.required),
      check: new FormControl(false, Validators.required)
    });
  }

  cancel(){
    this.dialogRef.close({approved: false});
  }
  approve() {
    if (!this.dateForm.valid || this.dateForm.get('check').value === false) {
      return;
    }
    let selectedDate: Date = new Date(this.dateForm.get('picker').value);
    console.log("selectedDate : "+selectedDate.getTime());
    
    this.dialogRef.close({approved: true, selectedDateMillies:selectedDate.getTime()});
  }

}
