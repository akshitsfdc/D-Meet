import { SignUpModel } from './../shared/sign-up-model';
import { EqualValidator } from './equal-validators';
import { LengthValidators } from './length.validators';
import { AuthService } from './../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, NgForm } from '@angular/forms';
import { parseSelectorToR3Selector } from '@angular/compiler/src/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {


  hide = true;
  invalidCredentials = false;
  private signUpObject: SignUpModel;

  loginUsernameTxt: String;
  loginPasswordTxt: String;
  nameTxt: String;
  emailTxt: String;
  passwordTxt: String;
  confirmTxt: String;

  loginForm = new FormGroup({
    lEmail: new FormControl('', [Validators.required, Validators.email]),
    lPassword: new FormControl('', Validators.required)
  });

  registerForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [LengthValidators.required, LengthValidators.lengthRestriction]),
    reEnterPassword: new FormControl('', [LengthValidators.required, EqualValidator.validateConfirm])
  });

  constructor(private authService: AuthService, private router: Router) {

  }

  ngOnInit(): void {
    this.authService.isLoggedIn()
      .subscribe(
        user => {
          if (user) {
            console.log("user : "+JSON.stringify(user));
            this.router.navigate(['home']);
          }
          console.log(user)

        }
      );
  }
  get name() {
    return this.registerForm.get('name');
  }
  get emailAdress() {
    return this.registerForm.get('email');
  }
  get pwd() {
    return this.registerForm.get('password');
  }
  get reEnterPwd() {
    return this.registerForm.get('reEnterPassword');
  }
  get lEmail() {
    return this.loginForm.get('lEmail');
  }
  get lPassword() {
    return this.loginForm.get('lPassword');
  }
  private signup() {
    let email: String = this.emailAdress.value;
    let password: String = this.pwd.value;

    this.authService.signUp(email, password).then((result) => {

      this.navigateTohome();
    }).catch((error) => {
      console.log(error.message);
    })

  }
  private login() {
    let email: String = this.lEmail.value;
    let password: String = this.lPassword.value;

    this.authService.signIn(email, password).then(result => {
      this.navigateTohome();
    }).catch((error) => {
      console.log(error.message);
    })

  }
  private navigateTohome() {
    this.router.navigate(['']);
  }
  loginInputChanged() {
    this.invalidCredentials = false;
  }
  onSubmit(regForm: NgForm) {
    this.signup();
  }
  loginSubmit(loginForm: NgForm) {
    if (loginForm.valid) {
      this.login();
    } else {
      this.invalidCredentials = true;
    }
  }
  // private setupSignupObject() {

  // }
}
