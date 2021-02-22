import { IncomingCallBottomSheetComponent } from './../incoming-call-bottom-sheet/incoming-call-bottom-sheet.component';
import { Injectable } from "@angular/core";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { PatientUserData } from "src/app/models/patient-user-data";
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { CallerModel } from 'src/app/models/caller-model';


@Injectable({
    providedIn: 'root'
})

export class SessionService {

    private sharedData: any;
    private userData: PatientUserData;
    private callerObs: Subscription = null;
    private audio = new Audio();
    private callerCollection:string = "caller_collection";

    constructor(private _bottomSheet: MatBottomSheet, private firestore:FirestoreService, private authService: AuthService) {
    
        // this.openCallingBottomSheet();

        
        
          this.audio.src = "/assets/audio/ringing.wav";
          this.audio.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        }, false);

        
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
    private subscribeToCalls(callCollection: string, callDocument: string):void {
        this.callerObs = this.firestore.getDocChanges(callCollection, callDocument)
        .subscribe((change) => {
            const type: string = change.type;
            const caller: CallerModel = new CallerModel();
            Object.assign(caller, change.payload.data());
            // const caller: CallerModel = change.payload.data() as CallerModel;
            if (caller.isNewCall()) {
                console.log("got a call");
                 this.startTone();
                this.openCallingBottomSheet(caller);
            }
        
        });
    }
    private loadUserData(userId:string):void{
    
        this.firestore.getValueChanges('user-data-patient', userId)
        .subscribe(
          
          {
            next(userData){
              let userdata:PatientUserData = new PatientUserData();
                  Object.assign(userdata, userData); 
                  this.PatientUserData = userdata;
                //   if (this.PatientUserData.) {
                      
                //   }
           },
           error(msg){
            console.log("Obs error >> : "+msg);
           },
           complete: () => console.log('completed')
          });
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

    public openCallingBottomSheet(caller:any):void {
        this._bottomSheet.open(IncomingCallBottomSheetComponent, {disableClose:true, closeOnNavigation:false, panelClass: 'bottom-sheet-custom', data:caller});
    }


}