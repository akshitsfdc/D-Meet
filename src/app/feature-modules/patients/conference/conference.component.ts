import { PatientUserData } from 'src/app/models/patient-user-data';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FirestoreService } from 'src/app/services/firestore.service';
import { SessionService } from '../service/session.service';
import { map, shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MeetingClientService } from '../service/meeting-client.service';
import { MatSidenav } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import { MediaAlertDialogComponent } from 'src/app/media-alert-dialog/media-alert-dialog.component';
import { DOCUMENT } from '@angular/common';
import { PrescriptionDialogComponent } from 'src/app/prescription-dialog/prescription-dialog.component';
import { BookedPatient } from '../../common-features/models/booked-patient';
import { CallerModel } from '../../common-features/models/caller-model';
import { ChatModel } from '../../common-features/models/chat-model';
import { Prescription } from '../../common-features/models/prescription';
import { MediaSignal } from '../../common-features/models/media-signal';

@Component({
  selector: 'app-conference',
  templateUrl: './conference.component.html',
  styleUrls: ['./conference.component.scss'],
  providers: [MeetingClientService]
})
export class ConferenceComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('drawer') public sidenav: MatSidenav;

  public localMute: boolean = true;
  public currentPatient: BookedPatient;
  public connectionStatus: string;
  public remoteVisible: boolean = false;
  public thubnailVisible: boolean = true;

  isExpanded: boolean = false;

  private callerCollection: string;

  private callerObs: Subscription = null;

  public caller: CallerModel;

  public chatMsgRT: string = "";
  public currentUser: PatientUserData;

  public chatCollection: ChatModel[] = [];

  public unreadMessages: number = 0;

  public mediaSignal: MediaSignal;
  public mediaSignalRemote: MediaSignal;
  public bottombarVisible: boolean = true;
  public fullScreenFlag: boolean = false;
  public elem: HTMLElement;

  public prescription: Prescription;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );


  constructor(private matDialog: MatDialog, public meetingService: MeetingClientService,
    private breakpointObserver: BreakpointObserver, private session: SessionService,
    private firestore: FirestoreService, private router: Router,
    @Inject(DOCUMENT) private document: any) {
    this.caller = this.session.getSharedData().caller as CallerModel;
    this.mediaSignal = new MediaSignal();
    this.mediaSignalRemote = new MediaSignal();
  }




  ngOnInit(): void {

    this.elem = document.documentElement;

    this.elem.onfullscreenchange = () => {
      this.fullScreenFlag = !this.fullScreenFlag;
    }

  }


  ngAfterViewInit(): void {

    console.log("  >> " + this.caller.getCallerId());


    const videoEnabled: boolean = this.session.getSharedData().videoEnabled as boolean;

    this.currentUser = this.session.getUserData();

    this.meetingService.setRoomId(this.caller.getRoomId());
    this.meetingService.setCalleeIceDoc(this.currentUser.getUserId());
    this.meetingService.setCallerIceDoc(this.caller.getCallerId());

    this.meetingService.setCallBack(() => {

      this.meetingService.setConnectionStatus("CONNECTED");

    });

    this.meetingService.setDataChannelOnOpenCallback(() => {
      if (!videoEnabled) {
        this.videoToggle();

      }
      this.openFullscreen();
    })

    this.meetingService.setOnMessageCallback((data: string) => {
      this.onMessage(data);
    });
    this.meetingService.setNoMediaCallback((type: string, msg: string, ok: string) => {
      this.showMediaDialog(type, msg, ok);
    })

    this.sendAnswer();


    this.subscribeToPrescription();

  }

  public sendAnswer(): void {

    this.meetingService.setConnectionStatus("Preparing...");

    this.firestore.update(this.session.getCallerCollection(), this.session.getUserData().getUserId(), Object.assign({}, this.setupAnswerObject()))
      .then(() => {
        console.log("answer sent");

        this.meetingService.pickupNow();
      })
      .catch(error => {
        console.log("Error : caller candidates could not be added.");
        this.meetingService.setConnectionStatus("Failed...");
      });
  }

  public sendReject(): void {

    this.firestore.update(this.session.getCallerCollection(), this.session.getUserData().getUserId(), Object.assign({}, this.setupRejectObject()))
      .then(() => {
        // this.meetingService.hangUp();
        this.router.navigate(['patient/home']);
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

    this.chatCollection.push(chat);

    this.chatMsgRT = "";

    return chat;
  }

  public sendMessage(): void {

    const dataChannel: RTCDataChannel = this.meetingService.getDataChannel();

    if (dataChannel && dataChannel.readyState === 'open') {
      const data: string = JSON.stringify(Object.assign({}, this.setSenderChatObj()));
      console.log("message sent !");
      dataChannel.send(data);
    }

  }

  private onMessage(data: string): void {
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
        this.sendReject();
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

  private subscribeToPrescription(): void {

    let collectionPath: string = "user-data-patient/" + this.currentUser.getUserId() + "/prescriptions";

    this.firestore.getPrescriptionChanges(collectionPath, "doctorId", this.caller.getCallerId(), "roomId", this.caller.getRoomId(), 1, "writtenTime")

      .subscribe(docChangeList => {

        docChangeList.forEach(async (change) => {

          let remotePres = new Prescription();
          Object.assign(remotePres, change.payload.doc.data());

          if (!this.prescription) {
            this.prescription = new Prescription();
            this.prescription = remotePres;
          } else {
            this.updatePrescription(remotePres);
          }

        });

      });
  }

  private updatePrescription(presUpdate: Prescription) {
    this.prescription.setPrescription(presUpdate.getPrescription());
  }
  public showPrescription() {

    this.matDialog.open(PrescriptionDialogComponent, {
      maxWidth: '560px', width: '560px',

      data: { prescription: this.prescription, isDoctor: false }

    }).afterClosed().toPromise()
      .then(result => {

      });
  }

}
