import { ChatModel } from './../../../models/chat-model';
import { CallerModel } from './../../../models/caller-model';
import { BookedPatient } from 'src/app/models/booked-patient';
import { SessionService } from './../services/session.service';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';
import { FirestoreService } from 'src/app/services/firestore.service';
import { QueueModel } from 'src/app/models/queue-model';
import { DoctorUserData } from 'src/app/models/doctor-user-data';
import { Router } from '@angular/router';
import { MeetingHostService } from '../services/meeting-host.service';

@Component({
  selector: 'app-conference',
  templateUrl: './conference.component.html',
  styleUrls: ['./conference.component.scss'],
  providers:[MeetingHostService]
})
export class ConferenceComponent implements OnInit, OnDestroy {


  @ViewChild('chatContainer') private chatContainer: ElementRef;

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

  public chatMsgRT: string = "";
  public currentUser: DoctorUserData;

  public chatCollection: ChatModel[] = [];

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
  );
  
  constructor(public meetingService: MeetingHostService, private breakpointObserver: BreakpointObserver, private session: SessionService,
    private firestore: FirestoreService, private router: Router) { 
    
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
    
    this.currentUser = this.session.getUserData();
    
    const userId = this.currentUser.getUserId();
    let roomId: string = userId + "_" + (new Date().getTime());
  

    //return;
    this.meetingService.setRoomId(roomId);

    this.meetingService.setCalleeIceDoc(this.currentPatient.getPatientId());

    this.meetingService.setCallerIceDoc(userId);

    this.meetingService.setCallStartCallback(() => {
      this.sendCall(this.callerCollection, this.currentPatient.getPatientId(), roomId);
    });
    this.meetingService.setOnMessageCallback((data:string) => {
      this.onMessage(data);
    });
    //this.meetingService.playPreRing();
    this.meetingService.callNow();
    
  }

  private sendCall(callCollection: string, callDocument: string, roomId:string): void {
  


    this.firestore.update(callCollection, callDocument, Object.assign({}, this.setupCallerObject(roomId)))
      .then(() => {

       // this.meetingService.stopPrering();
        this.meetingService.setConnectionStatus("Ringing...");
        this.meetingService.startRingTimer();
         
        console.log("Signal sent!");

        this.callerObs = this.firestore.getDocChanges(callCollection, callDocument)
          .subscribe((change) => {

            const type: string = change.type;
            
            const caller: CallerModel = new CallerModel();
            Object.assign(caller, change.payload.data());

            this.routeAnswer(caller);

          
          });
        
      })
      .catch(error => {
        console.log("Error : caller candidates could not be added.");
        this.meetingService.setConnectionStatus("Connection failed");
        this.meetingService.stopPrering();
      });
  }

  public endCall() {
    this.sendReject(this.callerCollection, this.currentPatient.getPatientId());
  }
  public sendReject(callCollection: string, callDocument: string): void {

    this.meetingService.stopRinging();
    this.navigateBack();

    // this.closeBottomSheet();

    this.firestore.update(callCollection, callDocument, Object.assign({}, this.setupRejectObject()))
      .then(() => {
        this.meetingService.setConnectionStatus("Ended");
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
      this.meetingService.stopRinging();
      this.navigateBack();
    } else if (caller.isAnswered() && caller.isBusy()) {
      
    } else {
      
    }
  }

  private navigateBack(): void{
    let data = {
      queue: this.session.getSharedData().queue as QueueModel,
      doctor: this.session.getSharedData().doctor as DoctorUserData
    }
    this.session.setSharedData(data);
    this.router.navigate(['doctor/meetup-lobby']);
  }

  private setupCallerObject(roomId:string): CallerModel {
    
    let caller: CallerModel = new CallerModel();

    caller.setBusy(true);
    caller.setAnswered(false);
    caller.setNewCall(true);
    caller.setReject(false);
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

  public setSenderChatObj():ChatModel {

    const date: Date = new Date();
    const senderLabel: string = this.currentUser.getFirstName() + ", " + date.getHours() + ':' + date.getMinutes();
    const timeLabel: string = date.getHours() + ':' + date.getMinutes();

    let chat: ChatModel = new ChatModel();
    chat.setMsg(this.chatMsgRT);
    chat.setSenderId(this.currentUser.getUserId());
    chat.setSenderLabel(senderLabel);
    chat.setTime(+date.getTime());
    chat.setTimeLabel(timeLabel);

    this.chatCollection.push(chat);

    this.chatMsgRT = "";

    return chat;
  }

  public sendMessage(): void{
   
    const dataChannel: RTCDataChannel = this.meetingService.getDataChannel();
    if (dataChannel && dataChannel.readyState === 'open') {
      const data: string = JSON.stringify(Object.assign({}, this.setSenderChatObj()));
      console.log("message sent !");
      dataChannel.send(data);
    }

  }

  private onMessage(data: string) {
    
    console.log("message recieved !");
    
    const chatJson: any = JSON.parse(data);
    const chat: ChatModel = new ChatModel();
    Object.assign(chat, chatJson);

    this.chatCollection.push(chat);
  }


}