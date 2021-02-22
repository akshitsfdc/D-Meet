import { CallerModel } from 'src/app/models/caller-model';
import { MeetingClientService } from './../../../services/meeting-client.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { BookedPatient } from 'src/app/models/booked-patient';
import { FirestoreService } from 'src/app/services/firestore.service';
import { SessionService } from '../service/session.service';
import { map, shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';

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

  public caller: CallerModel;

  public micOn: boolean = true;
  public videoOn: boolean = true;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
  );
  
    
  constructor(public meetingService: MeetingClientService, private breakpointObserver: BreakpointObserver, private session: SessionService,
    private firestore: FirestoreService, private router:Router,) { 
    this.caller = this.session.getSharedData() as CallerModel;
  }

  ngOnInit(): void {
    console.log("  >> "+this.caller.getCallerId());
    
    this.meetingService.setRoomId(this.caller.getRoomId());
    this.meetingService.setCalleeIceDoc(this.session.getUserData().getUserId());
    this.meetingService.setCallerIceDoc(this.caller.getCallerId());

    this.meetingService.setCallBack(() => {
      this.connectionStatus = "CONNECTED";
      // this.meetingService.st
    });

    this.sendAnswer();

  }

  
  public sendAnswer(): void {
  
    this.connectionStatus = "Connecting...";
    this.firestore.update(this.session.getCallerCollection(), this.session.getUserData().getUserId(), Object.assign({}, this.setupAnswerObject()))
      .then(() => {
        console.log("answer sent");
        
        this.meetingService.pickupNow();
      })
      .catch(error => {
        console.log("Error : caller candidates could not be added.");
      });
  }

  public sendReject(): void {

    this.firestore.update(this.session.getCallerCollection(), this.session.getUserData().getUserId(), Object.assign({}, this.setupRejectObject()))
      .then(() => {
        this.meetingService.hangUp();
        this.router.navigate(['patient/meetup-lobby']);
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
  private setupAnswerObject(): CallerModel {
    
    let caller: CallerModel = new CallerModel();

    caller.setBusy(true);
    caller.setAnswered(true);
    caller.setNewCall(false);

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
