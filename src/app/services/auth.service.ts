
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private loggedInUserId: string;

  public isDoctor: boolean;

  constructor(
    public afAuth: AngularFireAuth
  ) {
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


  public getUserId(): string {
    return this.loggedInUserId;
  }
  // Sign up with email/password
  signUp(email, password) {

    return this.afAuth.createUserWithEmailAndPassword(email, password);

  }

  // Sign in with email/password
  signIn(email, password): Promise<firebase.default.auth.UserCredential> {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }
  signOut() {
    return this.afAuth.signOut();
  }

  isLoggedIn() {
    return this.afAuth.authState;
  }

  getUser(): Promise<firebase.default.User> {
    return firstValueFrom(this.afAuth.authState);
  }

  sendPasswordResetMail(email: string): Promise<void> {

    return this.afAuth.sendPasswordResetEmail(email.trim());

  }

  resetPassword(code: string, password: string): Promise<void> {
    return this.afAuth.confirmPasswordReset(code.trim(), password.trim());
  }

  public changeUserStatusOnLogout(userId: string): void {
    const userStatusDatabaseRef = firebase.default.database().ref('/status/' + userId);
    userStatusDatabaseRef.update({
      status: 'offline',
      last_changed: firebase.default.database.ServerValue.TIMESTAMP,
    });
  }
  public changeUserStatusOnLogin(userId: string): void {
    const userStatusDatabaseRef = firebase.default.database().ref('/status/' + userId);
    userStatusDatabaseRef.update({
      status: 'online',
      last_changed: firebase.default.database.ServerValue.TIMESTAMP,
    });
  }

}
