import { CallerModel } from './../../../models/caller-model';
import { BookedPatient } from 'src/app/models/booked-patient';
import { SessionService } from './../services/session.service';
import { MeetingHostService } from './../../../services/meeting-host.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-conference',
  templateUrl: './conference.component.html',
  styleUrls: ['./conference.component.scss']
})
export class ConferenceComponent implements OnInit, OnDestroy {

  public localMute: boolean = true;
  public currentPatient: BookedPatient;
  public connectionStatus: string;
  public remoteVisible: boolean = false;
  public thubnailVisible: boolean = true;

  isExpanded: boolean = false;

  private callerCollection: string;

  private callerObs: Subscription = null;

  public micOn: boolean = true;
  public videoOn: boolean = true;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
  );
  
  constructor(public meetingService: MeetingHostService, private breakpointObserver: BreakpointObserver, private session: SessionService, private firestore: FirestoreService) { 
    
    try{
      this.currentPatient = this.session.getSharedData().currentPatient;
    } catch {
      this.currentPatient = new BookedPatient();
    }
    
    this.connectionStatus = "Connecting...";
    this.callerCollection = "caller_collection";

  }
  

  ngOnInit(): void {

    console.log("this.session.getUserData().getUserId() >> " + this.session.getUserData().getUserId());
    console.log("this.currentPatient.getPatientId() >> " + this.currentPatient.getPatientId());
    console.log("this.currentPatient.getUserId() >> "+this.session.getUserData().getUserId());
    
    const userId = this.session.getUserData().getUserId();
    let roomId: string = userId + "_" + (new Date().getTime());
    
    this.meetingService.setRoomId(roomId);

    this.meetingService.setCalleeIceDoc(this.currentPatient.getPatientId());

    this.meetingService.setCallerIceDoc(userId);

    this.meetingService.setCallBack(() => {
      this.connectionStatus = "CONNECTED";
      // this.meetingService.st
    });

    this.meetingService.setCallStartCallback(() => {
      this.sendCall(this.callerCollection, this.currentPatient.getPatientId(), roomId);
    });
   
    this.meetingService.callNow();
    
  }

  private sendCall(callCollection: string, callDocument: string, roomId:string): void {
    
    this.connectionStatus = "Connecting...";

    this.firestore.update(callCollection, callDocument, Object.assign({}, this.setupCallerObject(roomId)))
      .then(() => {
        this.connectionStatus = "Ringging...";
        
        this.meetingService.startRingTimer();
         
        console.log("Signal sent!");

        this.callerObs = this.firestore.getDocChanges(callCollection, callDocument)
          .subscribe((change) => {
            const type: string = change.type;

            const caller: CallerModel = new CallerModel();
            Object.assign(caller, change.payload.data());
          
          });
        
      })
      .catch(error => {
        console.log("Error : caller candidates could not be added.");
      });
  }

  public sendReject(callCollection: string, callDocument: string): void {
    
    this.connectionStatus = "Canceling...";

    this.meetingService.stopRinging();

    // this.closeBottomSheet();

    this.firestore.update(callCollection, callDocument, Object.assign({}, this.setupRejectObject()))
      .then(() => {
        this.connectionStatus = "CANCLED";
        //this.closeBottomSheet();
      })
      .catch(error => {
        console.log("Error : caller candidates could not be added.");
      });
  }

  private setupRejectObject(): CallerModel {
    
    let caller: CallerModel = new CallerModel();

    caller.setBusy(false);
    caller.setAnswered(false);
    caller.setNewCall(false);
    caller.setReject(true);

    return caller;
    
  }
  private routeAnswer(caller:CallerModel) {
    if (caller.isReject()) {
      
    } else if (caller.isAnswered() && caller.isBusy()) {
      
    } else {
      
    }
  }

  private setupCallerObject(roomId:string): CallerModel {
    
    let caller: CallerModel = new CallerModel();

    caller.setBusy(true);
    caller.setAnswered(false);
    caller.setNewCall(true);
    caller.setCallerName(this.session.getUserData().getFirstName() + " " + this.session.getUserData().getLastName());
    caller.setCallerId(this.session.getUserData().getUserId());
    caller.setRoomId(roomId);

    return caller;

    
  }

  ngOnDestroy(): void {
    this.meetingService.unsubscribe();
  }

  micToggle(){
    if (this.micOn) {

      if (this.meetingService.getLocalStream().getAudioTracks().length > 0) {
        this.meetingService.getLocalStream().getAudioTracks().forEach(track => { track.enabled = false; });
      }
      
    } else {
      if (this.meetingService.getLocalStream().getAudioTracks().length > 0) {
        this.meetingService.getLocalStream().getAudioTracks().forEach(track => { track.enabled = true; });
      }
       
    }
    this.micOn = !this.micOn;
  }
  videoToggle(){
    if (this.videoOn) {
      if (this.meetingService.getLocalStream().getVideoTracks().length > 0) {
        this.meetingService.getLocalStream().getVideoTracks().forEach(track => { track.enabled = false; });
      }
    } else {
      if (this.meetingService.getLocalStream().getVideoTracks().length > 0) {
        this.meetingService.getLocalStream().getVideoTracks().forEach(track => {track.enabled = true;});
      }
    
      
     }
    this.videoOn = !this.videoOn;
  }

}