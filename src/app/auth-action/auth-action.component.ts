import { AuthService } from 'src/app/services/auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';

@Component({
  selector: 'app-auth-action',
  templateUrl: './auth-action.component.html',
  styleUrls: ['./auth-action.component.css']
})
export class AuthActionComponent implements OnInit {

  hide:boolean = true;
  showProgressBar:boolean = false;
  disableReset:boolean = false;
  mode:string;
  private code:string;

  passwordForm:FormGroup;

  constructor(private auth:AuthService,private activatedActivated: ActivatedRoute, private router: Router, private matDialog: MatDialog) {}

  ngOnInit(): void {

    this.mode = this.activatedActivated.snapshot.queryParams['mode'];
    this.code = this.activatedActivated.snapshot.queryParams['oobCode'];

    this.passwordForm = new FormGroup({
      password: new FormControl('', Validators.required),
      confirmPassword: new FormControl('', Validators.required)
    });
  }

  get password(){
    return this.passwordForm.get('password');
  }
  get confirmPassword(){
    return this.passwordForm.get('confirmPassword');
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

      this.showProgress();
      let pass = (this.password.value as string).toString().trim();
      this.auth.resetPassword(this.code, pass)
      .then(() => {

        this.showMessageDialog("Success", "Your password has been reset successfully, please continue to login with your new password", "OK");
        this.hideProgress();

      })
      .catch(error => {
        //error
       this.hideProgress();
      });
    }
  }

  private showMessageDialog(headerText:string, msg:string, ok:string):void{

    let dialogData = {
      header : headerText,
      message : msg,
      okText: ok
    }

    let dialog = this.matDialog.open(MessageDialogComponent, {data: dialogData , disableClose: false,
      maxWidth : '300px'
    });
  

    let sub = dialog.afterClosed().subscribe(result => {

        this.router.navigate(['login']);
        sub.unsubscribe()
    });
  }

  private showProgress():void{
    this.showProgressBar = true;
    this.disableReset = true;
  }
  private hideProgress():void{
    this.showProgressBar = false;
    this.disableReset = false;
  }
}
