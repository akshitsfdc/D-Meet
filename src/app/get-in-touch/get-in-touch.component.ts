import { FirestoreService } from './../services/firestore.service';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GetInTouch } from '../models/get-in-touch';

@Component({
  selector: 'app-get-in-touch',
  templateUrl: './get-in-touch.component.html',
  styleUrls: ['./get-in-touch.component.scss']
})

export class GetInTouchComponent implements OnInit {

  public requestForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    emailAddress: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', Validators.required),
    request: new FormControl('', Validators.required)
  });


  constructor(public dialogRef: MatDialogRef<GetInTouchComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private firestore: FirestoreService) { }

  ngOnInit(): void {

    this.requestForm

  }

  get name(): AbstractControl | null {
    return this.requestForm.get('name');
  }
  get emailAddress(): AbstractControl | null {
    return this.requestForm.get('emailAddress');
  }

  get phone(): AbstractControl | null {
    return this.requestForm.get('phone');
  }

  get request(): AbstractControl | null {
    return this.requestForm.get('request');
  }
  public requestFormSubmit(form: FormGroupDirective): void {

    if (form.valid) {
      this.submitRequest();
    } else {

    }

  }
  private submitRequest() {

    const name: string = (this.name?.value as string).trim();
    const email: string = (this.emailAddress?.value as string).trim();
    const phone: string = (this.phone?.value as string).trim();
    const request: string = (this.request?.value as string).trim();

    const getInTouch: GetInTouch = new GetInTouch();

    getInTouch.setName(name);
    getInTouch.setPhone(phone);
    getInTouch.setEmail(email);
    getInTouch.setRequest(request);
    getInTouch.setStatus("pending");

    this.firestore.getInTouchRequest(Object.assign({}, getInTouch))
      .then(() => {
        this.dialogRef.close({ result: true });
      })
      .catch(error => {
        this.dialogRef.close({ result: false });
      });


  }
  public canceled(): void {
    this.dialogRef.close({ result: false });
  }
}
