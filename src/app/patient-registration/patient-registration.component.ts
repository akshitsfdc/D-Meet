import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from './../services/firestore.service';
import { PatientUserData } from './../models/patient-user-data';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LoadingDialogComponent } from '../loading-dialog/loading-dialog.component';

@Component({
  selector: 'app-patient-registration',
  templateUrl: './patient-registration.component.html',
  styleUrls: ['./patient-registration.component.css']
})

export class PatientRegistrationComponent implements OnInit {

  hide:boolean = true;
  showProgressBar:boolean = false;
  registrationForm:FormGroup;

  private loadingIndicator : MatDialogRef<any>;
  
  constructor(private firebaseAuth:AuthService , private firestore:FirestoreService, private matDialog: MatDialog, private router: Router) { }

  ngOnInit(): void {

    this.registrationForm = new FormGroup({
      firstName : new FormControl('', [Validators.required]),
      emailAddress: new FormControl('', [Validators.required, Validators.email]),
      lastName: new FormControl('', Validators.required),
      gender : new FormControl('female', Validators.required),
      password: new FormControl('', Validators.required),
      confirmPassword: new FormControl('', Validators.required),
      age : new FormControl('', Validators.required) 
    });
  }

  get firstName(){
    return this.registrationForm.get('firstName');
  }
  get lastName(){
    return this.registrationForm.get('lastName');
  }
  get emailAddress(){
    return this.registrationForm.get('emailAddress');
  }
  
  get age(){
    return this.registrationForm.get('age');
  }
  get experience(){
    return this.registrationForm.get('experience');
  }
  get gender(){
    return this.registrationForm.get('gender');
  }
  get password(){
    return this.registrationForm.get('password');
  }
  get confirmPassword(){
    return this.registrationForm.get('confirmPassword');
  }

  passwordChanged(){

    let password = this.password.value as string ;
    if(password.length <= 0){return;}

    let exp:RegExp = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    let valid = exp.test(password);

    if(!valid){
      this.password.setErrors({invalidPassword : true});
    }
    
    this.passwordequality();
    // alert("valid : "+valid+" => "+password);

  }
  
  passwordequality(){
    this.confirmPassword.setErrors(null);
    const pass = ((this.password.value as string).trim()).toLowerCase();
    const rePass = ((this.confirmPassword.value as string).trim()).toLowerCase();
    if(pass !== rePass){
      this.confirmPassword.setErrors({
        notEqalTo : true
      });
    }
  }
  
  private  signUpUser(email:string, password:string){

    this.showLoading();
     this.firebaseAuth.signUp(email, password).then(
      userData => {
        let user = userData.user.uid; 
        this.saveIdentityData(user);

      }
    ).catch((failure) => {
        console.log("Failure => "+failure);
        this.hideLoading();
        //error
    });
  }

  private saveIdentityData(userId:string):void{

    this.firestore.save('user-identity',userId, {doctor : false})
    .then(() => {
      this.saveUserData(userId);
    })
    .catch((failure) => {
        //error
        this.hideLoading();
    });
  }
  private saveUserData(userId:string):void{

    let userdata:PatientUserData = this.getFilledUserdata(userId);

    this.firestore.save('user-data-patient', userId, Object.assign({}, userdata))
     .then(
       () => {
          console.log("Data Saved!");
          this.hideLoading();
          this.router.navigate(['patient']);
          
       } 
     ).catch(error =>  {
      console.log(error);
      this.hideLoading();
      //error
     }     
    );
    
  }
  
  private getFilledUserdata(userId:string):PatientUserData{

    
    let userData:PatientUserData = new PatientUserData();

    userData.setFirstName((this.firstName.value as string).trim());
    userData.setLastName((this.lastName.value as string).trim());
    userData.setGender((this.gender.value as string).trim());
    userData.setAge(this.age.value);
    userData.setUserId(userId.trim());
    userData.setEmail((this.emailAddress.value as string).trim());
    userData.setRegistrationLocalTimeStapm((+new Date()) || 1000);
    userData.setPicUrl('');

    return userData;
  }

  onSubmit(form:FormGroup):void{

    if(form.valid){
      this.signUpUser((this.emailAddress.value as string).trim(), (this.password.value as string).trim());
    }

  }

  private showLoading():void{
    this.loadingIndicator = this.matDialog.open(LoadingDialogComponent, {disableClose: true, data: { message: "Registering..." }});
  }
  private hideLoading():void{
    if(this.loadingIndicator){
      this.loadingIndicator.close();
    }   

  }

}
