import { MeetingHostService } from './../../../services/meeting-host.service';
import { Component, OnInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import {MatSnackBar} from '@angular/material/snack-bar';
declare var MediaRecorder: any;
declare const window: any;

@Component({
  selector: 'app-doctor-conference',
  templateUrl: './doctor-conference.component.html',
  styleUrls: ['./doctor-conference.component.css']
})
export class DoctorConferenceComponent implements OnInit {

  @ViewChild('videos') videoDiv: ElementRef;

  configuration = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  };

  myMessage = "";

  callingInterfaceActive=true;
  showChatBox=false;
  fullScreen= true;
  startCallText = "Call Now";
  disableCallButton = false;
  private audio = new Audio();
  private ringTimer: any;
  


  

  private dataChannel;

  selectedMic = "";
  selectedCamera="";
  selectedSpeaker="";
  micArray : MediaDeviceInfo[];
  cameraArray : MediaDeviceInfo[];
  speakerArray : any[];

  userProfileImage = "https://hillcrest.rw/dashboard/assets/images/217.jpg";

  chats = [];
  recordedBlobs = [];
  mediaRecorder;

  peerConnection = null;
  localStream: MediaStream = null;
  remoteStream: MediaStream = null;
  roomDialog = null;
  roomId = null;
  localVideoStream = null;
  localMute = true;


  newMessageCount = 0;
  isNewMessage = false;
  showPresBox = false;
  myPrescription = "";

  cameraOn = true;
  micOn = true; 
  recordingOn = false;

  

  constructor(private firestore: AngularFirestore, private _snackBar: MatSnackBar, public meetingService:MeetingHostService) {
    this.setupDevice();
    this.initMediaDevices();
    this.audio.src = "/assets/audio/ringing.wav";
    this.audio.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
  }, false);
   
   }

  ngOnInit(): void {
    // this.openUserMedia();
  }

  private initMediaDevices(){
      navigator.mediaDevices.addEventListener('devicechange', event => {
        this.setupDevice();
    });
  }
 private getConnectedDevices(type, callback) {
    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            const filtered = devices.filter(device => device.kind === type);
            callback(filtered);
      }); 
}
  private setupDevice(): void{

    this.getConnectedDevices('videoinput',
    cameras => {
      console.log('Cameras found', cameras)
      this.cameraArray = cameras;
      if(this.cameraArray.length > 0){
        this.selectedCamera = this.cameraArray[0].deviceId;
      }
     }
    );
    this.getConnectedDevices('audioinput',
    mics => {
      console.log('mics found', mics)
      this.micArray = mics;
      if(this.micArray.length > 0){
        this.selectedMic = this.micArray[0].deviceId;

        
        this.openUserMedia();
      }
     }
    );
    this.getConnectedDevices('audiooutput',
    speakers => {
      console.log('speakers found', speakers)
      this.speakerArray = speakers;
     }
    );
  }
  openfullscreen() {
    // Trigger fullscreen

    const divF = document.querySelector('#videos');


    if (divF.requestFullscreen) {
      divF.requestFullscreen();
    }

  }

  callPatient() {
    this.callNow();
  }

  callNow(){
    this.startRingTimer();
    this.playAudio();
    this.disableCallButton = true;
    this.openfullscreen();
    this.startCallText = "Ringing...";
  }
  playAudio(){
    this.audio.load();
    this.audio.play();
  }
 
  private startRingTimer() {
    this.ringTimer = setTimeout(() => {
      this.audio.pause();
      this.callingInterfaceActive=false;
      clearTimeout( this.ringTimer);
    }, 25000);
  }
  toggleFullScreen(){
      if(this.fullScreen){
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
          this.fullScreen = false;
      }else{
        this.openfullscreen();
        this.fullScreen = true;
      }
  }
  chatButtonClicked(){
    this.showChatBox = true; 
    this.changeMessageStatusRead(this.chats);
  }
  closefullscreen() {

    // const divF = document.querySelector('#videos');

    // if (document.exitFullscreen) {
    //   document.exitFullscreen();
    // }

    // if (divF.requestFullscreen) {
    //   divF.requestFullscreen();
    // }
  }
  
  private addDataChannelListeners(){

       // Enable textarea and button when opened
      this.dataChannel.addEventListener('open', event => {
       console.log("DataChannel opened!");
      });
      this.dataChannel.addEventListener('close', event => {
        console.log("DataChannel closed!");
    });
   
    this.dataChannel.addEventListener('message', event => {
      const message = event.data;
       
        let messageObject = JSON.parse(message);

        messageObject.he = true;

        this.chats.push(messageObject);

        this.getNewMessageCount(this.chats);
  });
  }
  async createRoom() {

    this.remoteStream = new MediaStream();
    this.callNow();
    this.openfullscreen();
    const dataChannelParams = {ordered: true};
    const roomRef = this.firestore.collection('rooms').doc('xyz');


    this.peerConnection = new RTCPeerConnection(this.configuration);

    this.dataChannel = this.peerConnection.createDataChannel("Chat Channel", dataChannelParams);

    
    this.registerPeerConnectionListeners();
    this.addDataChannelListeners();

    this.localStream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    // Code for collecting ICE candidates below
    const callerCandidatesCollection = roomRef.collection('callerCandidates');

    this.peerConnection.addEventListener('icecandidate', event => {
      if (!event.candidate) {
        console.log('Got final candidate!');
        return;
      }
      console.log('Got candidate.. ');
      callerCandidatesCollection.add(event.candidate.toJSON());

    });
    // Code for collecting ICE candidates above

    // Add code for creating a room here
    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });

    await this.peerConnection.setLocalDescription(offer);

    const roomWithOffer = {
      offer: {
        type: offer.type,
        sdp: offer.sdp
      }
    }


    roomRef.set(roomWithOffer);


    this.peerConnection.addEventListener('track', event => {
      console.log('Got remote track..');
      event.streams[0].getTracks().forEach(track => {        
        this.remoteStream.addTrack(track);
      });
    });




    // Listening for remote session description below
    roomRef.snapshotChanges().pipe(
      map(async actions => {

        const data = actions.payload.data() as any;

        if (!this.peerConnection.currentRemoteDescription && data.answer) {
          console.log('Got remote description..');
          const answer = new RTCSessionDescription(data.answer)
          await this.peerConnection.setRemoteDescription(answer);
          // return { id, ...data };
        }
      })
    ).subscribe();
    // Listening for remote session description above

    // Listen for remote ICE candidates below

    roomRef.collection('calleeCandidates').snapshotChanges().pipe(
      map(snapshot => {
        snapshot.forEach(async change => {
          if (change.type === 'added') {
            let data = change.payload.doc.data();
            console.log('Got new remote ICE candidate.. ');
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));

            this.audio.pause();
            this.callingInterfaceActive=false;
            clearTimeout( this.ringTimer);
          }
        });
      })
    ).subscribe();
    // Listen for remote ICE candidates above

  }

  async joinRoom() {
    
    //temp code
    this.callingInterfaceActive=false;

    this.roomId = "xyz"//document.querySelector('#room-id').value;
    

    await this.joinRoomById(this.roomId);
    // roomDialog.open();
  }
  async joinRoomById(roomId) {

    this.remoteStream = new MediaStream();

    const roomRef = this.firestore.collection('rooms').doc(roomId);

    const roomSnapshot = await roomRef.get();
   

    if (roomSnapshot) {
      console.log('Create PeerConnection with configuration: ', this.configuration);
      this.peerConnection = new RTCPeerConnection(this.configuration);
      
          
      this.registerPeerConnectionListeners();
      // this.recieveDataChannelCallee();
      // this.addDataChannelListeners();

      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Code for collecting ICE candidates below
      const calleeCandidatesCollection = roomRef.collection('calleeCandidates');
      
      // await calleeCandidatesCollection.add({});
      this.peerConnection.addEventListener('icecandidate', event => {

        if (!event.candidate) {
          console.log('Got final candidate!');
          return;
        }
        console.log('Got candidate: ');
        calleeCandidatesCollection.add(event.candidate.toJSON());
      });
      // Code for collecting ICE candidates above

      this.peerConnection.addEventListener('track', event => {
        console.log('Got remote track..');
        event.streams[0].getTracks().forEach(track => {         
          this.remoteStream.addTrack(track);
        });
      });


      // let offer;
      // Code for creating SDP answer below
      let offer;

      roomSnapshot.subscribe(async (data) => {
        offer = data.data().offer;
        
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await this.peerConnection.createAnswer();
        console.log('Created answer..');
        await this.peerConnection.setLocalDescription(answer);

        const roomWithAnswer = {
          answer: {
            type: answer.type,
            sdp: answer.sdp,
          },
        };
        await roomRef.update(roomWithAnswer);
        // Code for creating SDP answer above

        // Listening for remote ICE candidates below
        roomRef.collection('callerCandidates').snapshotChanges().pipe(
          map(snapshot => {
            snapshot.forEach(async change => {
              if (change.type === 'added') {
                let data = change.payload.doc.data();
                console.log('Got new remote ICE candidate.. ');
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
              }
            });
          })
        ).subscribe();
      });


    }
  }
 
  
  registerPeerConnectionListeners() {
    this.peerConnection.addEventListener('icegatheringstatechange', () => {
      console.log(
        'ICE gathering state changed: ' + this.peerConnection.iceGatheringState);
    });

    this.peerConnection.addEventListener('connectionstatechange', () => {
      console.log('Connection state change: ' + this.peerConnection.connectionState);
    });

    this.peerConnection.addEventListener('signalingstatechange', () => {
      console.log('Signaling state change: ' + this.peerConnection.signalingState);
    });

    this.peerConnection.addEventListener('iceconnectionstatechange ', () => {
      console.log(
        'ICE connection state change: ' + this.peerConnection.iceConnectionState);
    });

    this.peerConnection.addEventListener('datachannel', (event) => {
      console.log(
        'ICE connection state change:..datachannel ' + this.peerConnection.iceConnectionState);
      this.dataChannel = event.channel;
      this.dataChannel.addEventListener('message', (event) => {
        const message = event.data;
       
        let messageObject = JSON.parse(message);

        messageObject.he = true;

        this.chats.push(messageObject);

        this.getNewMessageCount(this.chats);

      });
      
      this.dataChannel.addEventListener('open', event => {
        console.log("DataChannel opened..callee..!");
       });
       this.dataChannel.addEventListener('close', event => {
        console.log("DataChannel closed..callee..");
    });
    });
    
  }

  

  async openUserMedia() {
    const stream = await navigator.mediaDevices.getUserMedia(
      { 
            video: {
               deviceId: this.selectedCamera
            },
            audio: {
              deviceId: this.selectedMic,
              echoCancellation: true
          }
      }
      );
     
  
    this.localStream = stream;
    window.stream = stream; //for recording
    this.remoteStream = this.localStream;
    // this.remoteStream = new MediaStream();

    
  }
  micChanged(){
    if(!this.disableCallButton){
      this.openUserMedia();
    }
  }
  sendMessage(){

    if(!this.dataChannel ||  typeof(this.dataChannel) === undefined){
      console.log("Chat is not available at this time!");
      return;
    }
    
    if(this.myMessage.length <= 0){
      return;
    }
    const message = this.myMessage.trim(); 

    let messageObject = {he: false, img : this.userProfileImage, msg: message, status: 0};

    this.dataChannel.send(JSON.stringify(messageObject));
    
    this.chats.push(messageObject);

    this.myMessage = "";
    
  }
  async hangUp(e) {
    // const tracks = document.querySelector('#localVideo').srcObject.getTracks();
    // tracks.forEach(track => {
    //   track.stop();
    // });


    // if (this.remoteStream) {
    //   remoteStream.getTracks().forEach(track => track.stop());
    // }

    // if (peerConnection) {
    //   peerConnection.close();
    // }

    // document.querySelector('#localVideo').srcObject = null;
    // document.querySelector('#remoteVideo').srcObject = null;
    // document.querySelector('#cameraBtn').disabled = false;
    // document.querySelector('#joinBtn').disabled = true;
    // document.querySelector('#createBtn').disabled = true;
    // document.querySelector('#hangupBtn').disabled = true;
    // document.querySelector('#currentRoom').innerText = '';

    // Delete room on hangup
    if (this.roomId) {

      const roomRef = this.firestore.collection('rooms').doc(this.roomId);
      const calleeCandidates = await roomRef.collection('calleeCandidates').get();
      calleeCandidates.forEach(async candidate => {
        // await candidate.docs.delete();
      });
      const callerCandidates = await roomRef.collection('callerCandidates').get();
      callerCandidates.forEach(async candidate => {
        // await candidate.ref.delete();
      });
      // await roomRef.delete();
    }

    document.location.reload(true);
  }

  hideChatbox(){
    this.showChatBox = false;
    this.newMessageCount = 0;
    this.isNewMessage = false;
  }
  private getNewMessageCount(array:any[]){

    let i = 0;

    array.forEach(msgObject => {
      if( msgObject.he === true && msgObject.status !== 2 ){
        ++i;
      }
    });
    this.newMessageCount = i;
    if(this.newMessageCount > 0){
      this.isNewMessage = true;   
    }
    
  }
  private changeMessageStatusRead(array:any[]){

    array.forEach(msgObject => {
      if( msgObject.he === true){
        msgObject.status = 2;
      }
    });
    this.newMessageCount = 0;
    this.isNewMessage = false;
  }

  cancelPrescription(){
    this.showPresBox = false;
  }
  openPresBox(){
    this.showPresBox = true;
    this.showChatBox = false;
  }
  sendPrescription(){
    this.showPresBox = false;
    this.openSnackBar("Prescription Sent!", 2);
  }
  
  private openSnackBar(msg : string, duration) {
    this._snackBar.open(msg, "OK",  {
      duration: duration * 1000,
    });
  }

  cameraToggle(){
  
   if(this.cameraOn){
    this.localStream.getVideoTracks().forEach(track => {track.enabled = false;} );
   }else{
    this.localStream.getVideoTracks().forEach(track => {track.enabled = true;});
    
   }

   this.cameraOn = !this.cameraOn;
  
  }

  micToggle(){
    if(this.micOn){
      this.localStream.getAudioTracks().forEach(track => {track.enabled = false;} );
     }else{
      this.localStream.getAudioTracks().forEach(track => {track.enabled = true;});
      
     }
    this.micOn = !this.micOn;
  }
  callDisconnect(){
   
  }
  

}
