
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'firebase';
import { first } from 'rxjs/operators';

import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private firebaseAuth: any;
  private loggedInUserId: string;

  public isDoctor: boolean;

  constructor(
    public afAuth: AngularFireAuth
  ) {
    // let firebaseApp = firebase.getFirebase();
    // this.firebaseAuth = firebaseApp.auth();
    this.afAuth.authState.subscribe(res => {
      if (res && res.uid) {
        console.log('user is logged in');
        this.loggedInUserId = res.uid;
      } else {
        if (this.loggedInUserId) {
          this.changeUserStatusOnLogout(this.loggedInUserId);
        }
      }
    });
  }

  // Sign up with email/password
  signUp(email, password) {

    return this.afAuth.createUserWithEmailAndPassword(email, password);

  }

  // Sign in with email/password
  signIn(email, password): Promise<firebase.auth.UserCredential> {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }
  signOut() {
    return this.afAuth.signOut();
  }

  isLoggedIn() {
    return this.afAuth.authState;
  }

  getUser(): Promise<User> {
    return this.afAuth.authState.pipe(first()).toPromise();
  }

  sendPasswordResetMail(email: string): Promise<void> {

    return this.afAuth.sendPasswordResetEmail(email.trim());

  }

  resetPassword(code: string, password: string): Promise<void> {
    return this.afAuth.confirmPasswordReset(code.trim(), password.trim());
  }

  public changeUserStatusOnLogout(userId: string): void {
    const userStatusDatabaseRef = firebase.database().ref('/status/' + userId);
    userStatusDatabaseRef.update({
      status: 'offline',
      last_changed: firebase.database.ServerValue.TIMESTAMP,
    });
  }
  public changeUserStatusOnLogin(userId: string): void {
    const userStatusDatabaseRef = firebase.database().ref('/status/' + userId);
    userStatusDatabaseRef.update({
      status: 'online',
      last_changed: firebase.database.ServerValue.TIMESTAMP,
    });
  }

}
