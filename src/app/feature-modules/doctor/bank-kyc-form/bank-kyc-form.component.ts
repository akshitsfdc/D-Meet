import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { StorageService } from 'src/app/services/storage.service';
import { KYCModel } from '../models/kyc-model';
import { DialogData } from '../profile-edit/profile-edit.component';

@Component({
  selector: 'app-bank-kyc-form',
  templateUrl: './bank-kyc-form.component.html',
  styleUrls: ['./bank-kyc-form.component.css']
})
export class BankKycFormComponent implements OnInit {


    kycForm: FormGroup;
    identityProofFile: File;
    currentUser:firebase.User;
    kycModel:KYCModel;
    
    constructor(public dialogRef: MatDialogRef<BankKycFormComponent>,
      @Inject(MAT_DIALOG_DATA) public data: DialogData, private server:FirestoreService, private auth:AuthService, private storage:StorageService) {

      }

    ngOnInit(): void {

      this.kycModel = new KYCModel();

      this.kycForm = new FormGroup({
        ifsc: new FormControl('', [Validators.required]),
        accountNumber: new FormControl('', Validators.required),
        reAccountNumber: new FormControl('', [Validators.required]),
        beneficiaryName : new FormControl('', Validators.required),
        KYCDocumentType: new FormControl('', Validators.required),
        KYCDocument : new FormControl('', Validators.required),
        accountType: new FormControl('', Validators.required)
      });

      this.setCurrentUser();
      
     }

     private async setCurrentUser(){
    
      await this.auth.getUser()
        .then(user => this.currentUser = user)
        .catch(error => {
          console.log("Error getting current user");
          this.currentUser = null;
        });
     }
    get ifsc(){
      return this.kycForm.get('ifsc');
    }
      
    get accountNumber(){
      return this.kycForm.get('accountNumber');
    }
    get reAccountNumber(){
      return this.kycForm.get('reAccountNumber');
    }
    get beneficiaryName(){
      return this.kycForm.get('beneficiaryName');
    }
    
    get KYCDocumentType(){
      return this.kycForm.get('KYCDocumentType');
    }
    get KYCDocument(){
      return this.kycForm.get('KYCDocument');
    }
    get accountType(){
      return this.kycForm.get('accountType');
    }

    handleFileInput(files: FileList) {


        if (files && files[0]) {
          this.identityProofFile = files.item(0);      
          // const reader = new FileReader();
          // reader.onload = e => this.imageSrc = reader.result;
          // reader.readAsDataURL(this.fileToUpload);
          this.KYCDocument.setValue(this.identityProofFile.name.toString());
      }
    }

    uploadKYCDocument():void{


      // if(!file){
      //   this.openSnackBar("No file selected!", "Ok");
      //   return;
      // }
  
      // this.showLoading();
  
      const filePath = 'kycDocuments/'+Date.now().toString()+"_"+this.identityProofFile.name ;
  
      this.storage.saveFile(filePath, this.identityProofFile)
      .then(() =>{
        this.storage.getURL(filePath).then(url => {
          this.kycModel.setKycDocumentUrl(url);
          this.setupKycObject();
          this.server.save("kyc",this.currentUser.uid, Object.assign({}, this.kycModel) )
          .then(() => {
            console.log("KYC submitted!");
            this.closeDialog();
          })
          .catch(() => {
            console.log("KYC could not be submitted, some error occured please try later or contact support!");
          });
        }).catch(error => {console.log("No URL found!")});
      })
      .catch(err => {
        console.log("Error uploading file")
      });
      
    //   .snapshotChanges().pipe(
    //     finalize(() => {
    //       fileRef.getDownloadURL().subscribe(url=>{
    //         if(url){
    //             banner.setImageUrl(url);
    //             this.hideLoading();
    //             this.openSnackBar("Banner Picture has been uploaded to the server", "Done");
    //         }
    //      })
    //     } )
    //  )
    // .subscribe();
  
    }
    passwordChanged(){
      this.reAccountNumber.setErrors(null);
      const pass = ((this.accountNumber.value as string).trim()).toLowerCase();
      const rePass = ((this.reAccountNumber.value as string).trim()).toLowerCase();
      if(pass !== rePass){
        this.reAccountNumber.setErrors({
          notEqalTo : true
        });
      }
    }

    private setupKycObject():void{
      this.kycModel.setAccountNumber((this.accountNumber.value as string).toString().trim());
      this.kycModel.setIfscCode((this.ifsc.value as string).toString().trim());
      this.kycModel.setBeneficiary((this.beneficiaryName.value as string).toString().trim());
      this.kycModel.setUserId(this.currentUser.uid.trim());
      this.kycModel.setAccountType((this.accountType.value as string).toString().trim());
      this.kycModel.setKycDoccumentType((this.KYCDocumentType.value as string).toString().trim());
    }
    closeDialog(){
      this.dialogRef.close();
    }
    onSubmit(form:FormGroup){
      if(!this.currentUser){
        console.log("User is not logged in!");
        return;
      }
      if(form.valid){        
        this.uploadKYCDocument();
      }
    }

}
