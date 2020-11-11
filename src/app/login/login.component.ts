import { CreateAccountBottomSheetComponent } from './../create-account-bottom-sheet/create-account-bottom-sheet.component';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MessageDialogComponent } from './../message-dialog/message-dialog.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm:FormGroup;
  sendResetEmail:FormGroup;
  showProgressBar:boolean = false;
  disableButtons:boolean = false;
  
  constructor(private auth:AuthService, private matDialog: MatDialog, private _bottomSheet: MatBottomSheet, private route:Router) { }

  ngOnInit(): void {

    this.loginForm = new FormGroup({
      emailAddress: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required)
    });
    this.sendResetEmail = new FormGroup({
      resetrEmailAddress: new FormControl('', [Validators.required, Validators.email])
    });

  }

  get resetrEmailAddress(){
    return this.sendResetEmail.get('resetrEmailAddress');
  }
  get emailAddress(){
    return this.loginForm.get('emailAddress');
  }

  get password(){
    return this.loginForm.get('password');
  }
  
  private showMessageDialog(headerText:string, msg:string, ok:string):void{

    let dialogData = {
      header : headerText,
      message : msg,
      okText: ok
    }

    this.matDialog.open(MessageDialogComponent, {data: dialogData , disableClose: false,
      maxWidth : '300px'
    });
  }

  onSubmit(f:FormGroup){

    if(f.valid){

      this.showProgress();
      const email = (this.emailAddress.value as string).toString().trim();
      const pwd = (this.password.value as string).toString().trim();

      this.auth.signIn(email, pwd)
      .then((user) => {
        this.route.navigate(['']);
        this.hideProgress();
      })
      .catch(error => {
        console.log("error : "+error);
        //error
        this.hideProgress();
      });
    }

  }

  resetPasswordSubmit(form:FormGroup){

    
    if(form.valid){
      this.showProgressBar = true; 
      this.auth.sendPasswordResetMail((this.resetrEmailAddress.value as string).trim())
      .then(() =>{
        this.showMessageDialog("Email Sent", "We have sent you a reset email, please go to your mailbox and click on reset password link and follow the process to reset your password.", 'Got It');
        this.showProgressBar = false;        
      })
      .catch(error => {
        this.showProgressBar = false; 
       
        //error
      });
    }
  }

  private showProgress():void{
    this.showProgressBar = true;
    this.disableButtons = true;
  }
  private hideProgress():void{
    this.showProgressBar = false;
    this.disableButtons = false;
  }

  openBottomSheet(): void {
    this._bottomSheet.open(CreateAccountBottomSheetComponent);
  }

}
