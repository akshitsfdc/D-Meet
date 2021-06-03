import { MediaAlertDialogComponent } from './../../../media-alert-dialog/media-alert-dialog.component';
import { UtilsService } from 'src/app/services/utils.service';
import { SessionService } from './../services/session.service';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, Inject } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';
import { FirestoreService } from 'src/app/services/firestore.service';
import { DoctorUserData } from 'src/app/models/doctor-user-data';
import { Router } from '@angular/router';
import { MeetingHostService } from '../services/meeting-host.service';
import { MatSidenav } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import { DOCUMENT } from '@angular/common';
import { PrescriptionDialogComponent } from 'src/app/prescription-dialog/prescription-dialog.component';
import { MediaSignal } from '../../common-features/models/media-signal';
import { Prescription } from '../../common-features/models/prescription';
import { BookedPatient } from '../../common-features/models/booked-patient';
import { ChatModel } from '../../common-features/models/chat-model';
import { CallerModel } from '../../common-features/models/caller-model';
import { QueueModel } from '../../common-features/models/queue-model';

@Component({
  selector: 'app-conference',
  templateUrl: './conference.component.html',
  styleUrls: ['./conference.component.scss'],
  providers: [MeetingHostService]
})
export class ConferenceComponent implements OnInit, OnDestroy, AfterViewInit {


  @ViewChild('chatContainer') private chatContainer: ElementRef;
  @ViewChild('drawer') public sidenav: MatSidenav;

  public localMute: boolean = true;
  public currentPatient: BookedPatient;
  public remoteVisible: boolean = false;
  public thubnailVisible: boolean = true;

  isExpanded: boolean = false;

  private callerCollection: string;

  private callerObs: Subscription = null;

  public chatMsgRT: string = "";
  public currentUser: DoctorUserData;

  public chatCollection: ChatModel[] = [];

  public unreadMessages: number = 0;

  public mediaSignal: MediaSignal;
  public mediaSignalRemote: MediaSignal;

  public bottombarVisible: boolean = true;
  public fullScreenFlag: boolean = false;
  public elem: HTMLElement;

  private prescription: Prescription;

  private roomId: string;

  public activatePres: boolean = false;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private matDialog: MatDialog, public meetingService: MeetingHostService, private breakpointObserver: BreakpointObserver, private session: SessionService,
    private firestore: FirestoreService, private router: Router, private utill: UtilsService,

    @Inject(DOCUMENT) private document: any) {

    this.prescription = new Prescription();

    try {
      this.currentPatient = this.session.getSharedData().currentPatient;
    } catch {
      this.currentPatient = new BookedPatient();
    }

    this.callerCollection = "caller_collection";

    this.mediaSignal = new MediaSignal();
    this.mediaSignalRemote = new MediaSignal();

  }
  ngAfterViewInit(): void {

  }

  private initPrescription() {

    this.prescription.setName(this.currentUser.getFirstName() + ' ' + this.currentUser.getLastName());
    this.prescription.setPicUrl(this.currentUser.getPicUrl());
    this.prescription.setProfileId(this.currentUser.getProfileId());
    this.prescription.setEmail(this.currentUser.getEmail());
    this.prescription.setDoctorId(this.currentUser.getUserId());
    this.prescription.setPhoneNumber(this.currentUser.getPhoneNumber() || "");
    this.prescription.setDegree(this.currentUser.getDegree());
    this.prescription.setSpeciality(this.currentUser.getSpeciality());
    this.prescription.setClinicName(this.currentUser.getClinicName());
    this.prescription.setFullClinicAddress(this.currentUser.getFullClinicAddress());


    this.prescription.setPatientName(this.currentPatient.getName());
    this.prescription.setPatientId(this.currentPatient.getPatientId());
    this.prescription.setPatientAddress(this.currentPatient.getAddress() || "");
    this.prescription.setAge(this.currentPatient.getAge());
    this.prescription.setPatientgender(this.currentPatient.getGender() || "");
    this.prescription.setBookingId(this.currentPatient.getBookingId());
    this.prescription.setRoomId(this.roomId);
    this.prescription.setPrescription("");
    this.prescription.setWrittenTime((new Date()).getTime())
  }

  ngOnInit(): void {

    // return;

    this.elem = document.documentElement;
    this.elem.onfullscreenchange = () => {
      this.fullScreenFlag = !this.fullScreenFlag;
    }

    this.currentUser = this.session.getUserData();

    const userId = this.currentUser.getUserId();
    let roomId: string = userId + "_" + (new Date().getTime());

    this.roomId = roomId;

    //return;
    this.meetingService.setRoomId(roomId);

    this.meetingService.setCalleeIceDoc(this.currentPatient.getPatientId());

    this.meetingService.setCallerIceDoc(userId);

    this.meetingService.setCallBack(() => {

      this.meetingService.setConnectionStatus("CONNECTED");

    });
    this.meetingService.setTimeoverCallback(() => {
      this.endCall();
    });
    this.meetingService.setCallStartCallback(() => {
      this.sendCall(this.callerCollection, this.currentPatient.getPatientId(), roomId);
      this.openFullscreen();
    });
    this.meetingService.setOnMessageCallback((data: string) => {
      this.onMessage(data);
    });
    this.meetingService.setNoMediaCallback((type: string, msg: string, ok: string) => {
      this.showMediaDialog(type, msg, ok);

    });


    this.meetingService.callNow();

  }

  private sendCall(callCollection: string, callDocument: string, roomId: string): void {



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

    this.initPrescription();
  }

  public endCall() {
    this.meetingService.setHostDisconnectAction(true);
    this.sendReject(this.callerCollection, this.currentPatient.getPatientId());
  }
  public sendReject(callCollection: string, callDocument: string): void {

    this.meetingService.stopRinging();
    this.navigateBack();
    this.utill.showMsgSnakebar("Call disconnected");
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
  private routeAnswer(caller: CallerModel) {

    if (caller.isReject()) {

      this.meetingService.stopRinging();
      this.navigateBack();

      if (this.meetingService.isHostDisconnectAction()) {


      } else {
        this.utill.showMsgSnakebar("Call disconnected by " + this.currentPatient.getName());
      }
      this.activatePres = false;

    } else if (caller.isAnswered()) {

      this.activatePres = true;

    } else {

    }
  }

  private navigateBack(): void {
    let data = {
      queue: this.session.getSharedData().queue as QueueModel,
      doctor: this.session.getSharedData().doctor as DoctorUserData
    }
    this.session.setSharedData(data);
    this.router.navigate(['doctor/meetup-lobby']);
  }

  private setupCallerObject(roomId: string): CallerModel {

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
    this.closeFullscreen();
  }

  micToggle() {

    this.meetingService.getLocalStream().getAudioTracks().forEach(track => { track.enabled = !track.enabled; });

    this.mediaSignal.setAudioOn(!this.mediaSignal.isAudioOn());
    this.sendMediaSignal();
  }
  videoToggle() {

    this.meetingService.getLocalStream().getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
    });

    this.mediaSignal.setVideoOn(!this.mediaSignal.isVideoOn());

    this.sendMediaSignal();
  }

  public setSenderChatObj(): ChatModel {


    const date: Date = new Date();
    const senderLabel: string = this.currentUser.getFirstName() + ", " + date.getHours() + ':' + date.getMinutes();
    const timeLabel: string = date.getHours() + ':' + date.getMinutes();

    let chat: ChatModel = new ChatModel();
    chat.setMsg(this.chatMsgRT);
    chat.setSenderId(this.currentUser.getUserId());
    chat.setSenderLabel(senderLabel);
    chat.setTime(+date.getTime());
    chat.setTimeLabel(timeLabel);
    chat.setRead(false);

    this.chatCollection.push(chat);

    this.chatMsgRT = "";

    return chat;
  }

  public sendMessage(): void {

    try {
      const dataChannel: RTCDataChannel = this.meetingService.getDataChannel();
      if (dataChannel && dataChannel.readyState === 'open') {
        const data: string = JSON.stringify(Object.assign({}, this.setSenderChatObj()));
        console.log("message sent !");
        dataChannel.send(data);
      }
    } catch (error) {
      //error
    }


  }

  private onMessage(data: string) {

    try {


      console.log("message recieved !" + data);

      const chatJson: any = JSON.parse(data);

      if (chatJson.mediaSignal) {

        const mediaSignal: MediaSignal = new MediaSignal();
        Object.assign(mediaSignal, chatJson);

        this.mediaSignalRemote.setAudioOn(mediaSignal.isAudioOn());
        this.mediaSignalRemote.setVideoOn(mediaSignal.isVideoOn());

        return;

      }

      const chat: ChatModel = new ChatModel();
      Object.assign(chat, chatJson);

      if (!this.sidenav.opened) {
        this.unreadMessages += 1;
      } else {
        this.unreadMessages = 0;
        chat.setRead(true);
      }

      this.chatCollection.push(chat);

    } catch (error) {
      //error
    }

  }

  public readAll(): void {

    this.unreadMessages = 0;
    this.chatCollection.forEach(chat => {
      if (!chat.isRead()) {
        chat.setRead(true);
      }
    })
  }


  public sendMediaSignal(): void {

    console.log("this.mediaSignal : " + JSON.stringify(Object.assign({}, this.mediaSignal)));
    const dataChannel: RTCDataChannel = this.meetingService.getDataChannel();
    if (dataChannel && dataChannel.readyState === 'open') {
      const data: string = JSON.stringify(Object.assign({}, this.mediaSignal));
      console.log("media signal sent !");
      dataChannel.send(data);
    }

  }

  private showMediaDialog(type: string, msg: string, ok: string): void {

    let dialogData = {
      type: type,
      message: msg,
      okText: ok
    }

    this.matDialog.open(MediaAlertDialogComponent, {
      data: dialogData, disableClose: false,
      maxWidth: '300px'
    }).afterClosed().toPromise()
      .then(result => {
        this.navigateBack();
      });
  }

  public togleFullScreen() {
    if (this.fullScreenFlag) {
      this.closeFullscreen();
    } else {
      this.openFullscreen();
    }
  }
  private openFullscreen(): void {
    if (this.elem["requestFullscreen"]) {
      this.elem["requestFullscreen"]();

    } else if (this.elem["mozRequestFullScreen"]) {
      /* Firefox */
      this.elem["mozRequestFullScreen"]();

    } else if (this.elem["webkitRequestFullscreen"]) {
      /* Chrome, Safari and Opera */
      this.elem["webkitRequestFullscreen"]();

    } else if (this.elem["msRequestFullscreen"]) {
      /* IE/Edge */
      this.elem["msRequestFullscreen"]();

    }
  }

  /* Close fullscreen */
  private closeFullscreen(): void {
    if (this.document["exitFullscreen"]) {
      this.document["exitFullscreen"]();

    } else if (this.document["mozCancelFullScreen"]) {
      /* Firefox */
      this.document["mozCancelFullScreen"]();

    } else if (this.document["webkitExitFullscreen"]) {
      /* Chrome, Safari and Opera */
      this.document["webkitExitFullscreen"]();

    } else if (this.document["msExitFullscreen"]) {
      /* IE/Edge */
      this.document["msExitFullscreen"]();

    }
  }

  public showPrescription() {

    this.matDialog.open(PrescriptionDialogComponent, {
      maxWidth: '560px', width: '560px',

      data: { prescription: this.prescription, isDoctor: true }

    }).afterClosed().toPromise()
      .then(result => {

      });
  }
}