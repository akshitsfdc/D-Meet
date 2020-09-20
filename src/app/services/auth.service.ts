import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    public afAuth: AngularFireAuth
  ) { }

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


}
