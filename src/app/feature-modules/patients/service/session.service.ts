import { UtilsService } from './../../../services/utils.service';
import { IncomingCallBottomSheetComponent } from './../incoming-call-bottom-sheet/incoming-call-bottom-sheet.component';
import { Injectable } from "@angular/core";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { PatientUserData } from "src/app/models/patient-user-data";
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { CallerModel } from '../../common-features/models/caller-model';


@Injectable()

export class SessionService {

    private sharedData: any;
    private userData: PatientUserData;
    private callerObs: Subscription = null;
    private audio = new Audio();
    private callerCollection: string = "caller_collection";
    private isCallInit: boolean = false;
    public profilePlaceholder: string = "/assets/imgs/profile_placeholder.svg";

    constructor(private _bottomSheet: MatBottomSheet, private firestore: FirestoreService, private authService: AuthService, private utill: UtilsService, private route: Router) {

        console.log("SessionService created");
        this.audio.src = "/assets/audio/ringing.wav";
        this.audio.addEventListener('ended', function () {
            this.currentTime = 0;
            this.play();
        }, false);

        this.initSession();
    }

    public initSession() {
        this.authService.getUser()
            .then(userData => {

                this.loadUserData(userData.uid);
                this.subscribeToCalls(this.callerCollection, userData.uid);
            })
            .catch(error => {
                //error
                console.log("no auth >> ");

            });
    }


    public startTone() {
        try {
            this.audio.play()
                .catch(error => {
                    console.log("Ringtone could not be played!");
                });
        } catch {


        }

    }
    public endTone() {
        this.audio.pause();
    }
    public getCallerCollection() {
        return this.callerCollection;
    }
    private subscribeToCalls(callCollection: string, callDocument: string): void {

        this.callerObs = this.firestore.getDocChanges(callCollection, callDocument)
            .subscribe((change) => {
                const type: string = change.type;
                const caller: CallerModel = new CallerModel();
                Object.assign(caller, change.payload.data());
                // const caller: CallerModel = change.payload.data() as CallerModel;
                this.routeAnswer(caller);
            });
    }
    private routeAnswer(caller: CallerModel) {

        if (caller.isNewCall()) {
            console.log("got a call");
            this.startTone();
            this.openCallingBottomSheet(caller);
            this.isCallInit = true;
        } else if (caller.isReject()) {
            this.route.navigate(['patient/home']);
            this.endTone();
            this._bottomSheet.dismiss();
            if (this.isCallInit) {
                this.utill.showMsgSnakebar("Call diconnected");
            }

        }
    }
    private loadUserData(userId: string): void {

        let currentRef = this;

        this.firestore.getValueChanges('user-data-patient', userId)
            .subscribe(

                {
                    next(userData) {
                        let user: PatientUserData = new PatientUserData();
                        Object.assign(user, userData);
                        if (currentRef.getUserData() === null || currentRef.getUserData() === undefined) {
                            currentRef.setUserData(user);

                            console.log("got user data >> new ");
                        } else {
                            currentRef.updateUserData(user);
                            console.log("got user data updated ");
                        }

                    },
                    error(msg) {
                        console.log("Obs error >> : " + msg);
                    },
                    complete: () => console.log('completed')
                });
    }


    private updateUserData(userDataUpdate: PatientUserData): void {

        this.userData.setEmail(userDataUpdate.getEmail());
        this.userData.setFirstName(userDataUpdate.getFirstName());
        this.userData.setLastName(userDataUpdate.getLastName());
        this.userData.setGender(userDataUpdate.getGender());
        this.userData.setAge(userDataUpdate.getAge());
        this.userData.setPicUrl(userDataUpdate.getPicUrl());
        this.userData.setUserId(userDataUpdate.getUserId());
        this.userData.setRegistrationLocalTimeStapm(userDataUpdate.getRegistrationLocalTimeStapm());
    }

    public getUserData(): PatientUserData {
        return this.userData;
    }

    public setUserData(userData: PatientUserData): void {
        this.userData = userData;
    }

    public getSharedData(): any {
        return this.sharedData;
    }

    public setSharedData(sharedData: any): void {
        this.sharedData = sharedData;
    }

    public openCallingBottomSheet(caller: any): void {
        const objects = {
            caller: caller,
            session: this
        }
        this._bottomSheet.open(IncomingCallBottomSheetComponent, { disableClose: true, closeOnNavigation: false, panelClass: 'bottom-sheet-custom', data: objects });
    }


}