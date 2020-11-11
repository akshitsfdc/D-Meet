import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-patient-registration',
  templateUrl: './patient-registration.component.html',
  styleUrls: ['./patient-registration.component.css']
})

export class PatientRegistrationComponent implements OnInit {

  hide:boolean = true;
  showProgressBar:boolean = false;
  registrationForm:FormGroup;

  constructor() { }

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
  
  onSubmit(form:FormGroup):void{

    if(form.valid){

    }

  }

}
