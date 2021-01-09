import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';

@Component({
  selector: 'app-booking-dialog',
  templateUrl: './booking-dialog.component.html',
  styleUrls: ['./booking-dialog.component.scss']
})
export class BookingDialogComponent implements OnInit {

  bookingForm: FormGroup;

  mobNumberPattern = "^((\\+91-?)|0)?[0-9]{10}$";
  
  constructor(public dialogRef: MatDialogRef<MessageDialogComponent>
    ) { }


  ngOnInit(): void {
    this.bookingForm = new FormGroup({
      phone: new FormControl('', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$") ]),
      city: new FormControl('')
    });
  }
  get phone(){
    return this.bookingForm.get('phone');
  }
  get city(){
    return this.bookingForm.get('city');
  }
  close(){
    this.dialogRef.close();
  }

  cancel(){
    this.dialogRef.close({paying: false});
  }
 

  onSubmit(form:FormGroup) {
    if (form.valid) {
      this.dialogRef.close({paying: true, phoneNumber:(this.phone.value as string).toString().trim(), city:(this.city.value as string).toString().trim()});
    }
  }

}
