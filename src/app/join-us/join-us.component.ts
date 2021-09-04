import { UtilsService } from 'src/app/services/utils.service';

import { StorageService } from './../services/storage.service';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FirestoreService } from '../services/firestore.service';
import { JoinUs } from '../models/join-us';

@Component({
  selector: 'app-join-us',
  templateUrl: './join-us.component.html',
  styleUrls: ['./join-us.component.scss']
})

export class JoinUsComponent implements OnInit {

  public resumeFile!: File | null;
  public requestForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    emailAddress: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', Validators.required),
    resume: new FormControl('', Validators.required)
  });

  constructor(public dialogRef: MatDialogRef<JoinUsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private firestore: FirestoreService, private storage: StorageService, private uitills: UtilsService) { }

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

  get resume(): AbstractControl | null {
    return this.requestForm.get('resume');
  }
  public requestFormSubmit(form: FormGroupDirective): void {

    if (form.valid) {
      this.uploadDocument();
    } else {

    }

  }
  private submitRequest(url: any) {

    this.uitills.showLoading("submitting request...");

    const name: string = (this.name?.value as string).trim();
    const email: string = (this.emailAddress?.value as string).trim();
    const phone: string = (this.phone?.value as string).trim();

    const joinUs: JoinUs = new JoinUs();

    joinUs.setName(name);
    joinUs.setPhone(phone);
    joinUs.setEmail(email);
    joinUs.setDownloadUrl(url);
    joinUs.setStatus("pending");

    this.firestore.joinUsRequest(Object.assign({}, joinUs))
      .then(() => {
        this.uitills.hideLoading();
        this.dialogRef.close({ result: true });
      })
      .catch(error => {
        this.uitills.hideLoading();
        this.dialogRef.close({ result: false });
      });


  }
  public canceled(): void {
    this.dialogRef.close({ result: false });
  }

  public handleFileInput(event: Event) {

    let files!: FileList | null;

    if (event !== null) {
      files = (event?.target as HTMLInputElement).files;
    }




    if (files && files[0] && this.resume) {
      if (files.item(0) !== null) {
        this.resumeFile = files.item(0);
      }

      if (this.resume && this.resumeFile) {
        this.resume.setValue(this.resumeFile.name.toString());
      }

    }
  }

  uploadDocument(): void {

    if (this.resumeFile === null) {
      return;
    }

    this.uitills.showLoading("uploading resume...");

    const filePath = 'resumes/' + Date.now().toString() + "_" + this.resumeFile.name;

    this.storage.saveFile(filePath, this.resumeFile)
      .then(uploadTask => {
        uploadTask.ref
          .getDownloadURL()
          .then(url => {
            this.uitills.hideLoading();
            this.submitRequest(url);
          })
          .catch(error => {
            this.uitills.hideLoading();
          });

      })
      .catch(error => {
        console.log("error > " + error);
        this.uitills.hideLoading();
      });
  }

}
