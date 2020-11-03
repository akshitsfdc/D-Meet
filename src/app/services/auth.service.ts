
import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private firebaseAuth: any ;

  constructor(
    public afAuth: AngularFireAuth
  ) {
      // let firebaseApp = firebase.getFirebase();
      // this.firebaseAuth = firebaseApp.auth();
   }

  // Sign up with email/password
  signUp(email, password) {

   return this.afAuth.createUserWithEmailAndPassword(email, password);

  }

  // Sign in with email/password
  signIn(email, password) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }
  signOut() {
    return this.afAuth.signOut();
  }

  isLoggedIn() {
    return this.afAuth.authState;
  }

  getUser(){
    return this.afAuth.authState.pipe(first()).toPromise();
  }

 
}
