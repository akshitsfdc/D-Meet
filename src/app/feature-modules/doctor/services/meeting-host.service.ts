import { FirestoreService } from 'src/app/services/firestore.service';
import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';


@Injectable()
export class MeetingHostService {

  private remoteIceObs: Subscription = null;
  private answerObs: Subscription = null;
  
  private configuration:any = {
    iceServers: [
      {
        urls: [
              'stun:stun1.l.google.com:19302',
              'stun:stun2.l.google.com:19302',
            ]
      },
      {
          urls: "stun:doctormeetup.com:3478",
          username: "test",
          credential: "test123"
      },
      {
          urls: "turn:doctormeetup.com:3478",
          username: "test",
          credential: "test123"

      },
    ],
    iceCandidatePoolSize: 10,
  };

  private ringTimer: any;
  private audio = new Audio();
  private preRing = new Audio();

  private peerConnection: RTCPeerConnection;
  private dataChannel: RTCDataChannel;
  private localStream: MediaStream = new MediaStream();
  private remoteStream: MediaStream = new MediaStream();

  private roomCollection: string;
  private roomId: string;
  private callerCollection: string;
  private calleeCollection: string;
  private calleeIceDoc: string;
  private callerIceDoc: string;

  private cameraArray: MediaDeviceInfo[];
  private micArray: MediaDeviceInfo[];
  private speakerArray: MediaDeviceInfo[];

  private selectedCamera: string;
  private selectedMic: string;

  private connectionStatus: string;
  private callStartCallback: any;
  private onMessageCallback: any;
  private noMediaCallback: any;
  private conferenceCallback: any;
  private timeUpCallback: any;
  private hostDisconnectAction: boolean;

    
  constructor(private firestore: FirestoreService) { 

    this.roomCollection = "meeting_rooms";
    this.callerCollection = "caller_candidates";
    this.calleeCollection = "callee_candidates";

    this.audio.src = "/assets/audio/ringing.wav";
    this.preRing.src = "/assets/audio/pre_ring.wav";

    const currentRef = this;
    this.preRing.addEventListener('ended', async function () {
      
      await currentRef.delay(1000);
      this.play();
    }, false);
    this.audio.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
  }, false);
   

  }

  private  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
  public setTimeoverCallback(callback:any): void{
    this.timeUpCallback = callback;
  }
  public setCallBack(callback:any): void{
    this.conferenceCallback = callback;
  }
  public setNoMediaCallback(noMediaCallback):void {
    this.noMediaCallback = noMediaCallback;
  }
  public setCallStartCallback(callStartCallback) {
    this.callStartCallback = callStartCallback;
  }
  public getLocalStream():MediaStream {
    return this.localStream;
  }
  public isHostDisconnectAction(): boolean {
    return this.hostDisconnectAction;
}

public setHostDisconnectAction(hostDisconnectAction: boolean): void {
    this.hostDisconnectAction = hostDisconnectAction;
}

  public getRemoteStream():MediaStream {
    return this.remoteStream;
  }


  public setCallerIceDoc(iceDoc: string): void {
    
    this.callerIceDoc = iceDoc;
    
  }
  
  public setCalleeIceDoc(iceDoc:string): void {
    this.calleeIceDoc = iceDoc;
  }
  public setRoomId(roomId: string) {
    this.roomId = roomId;
  }
  private async openUserMedia() {

   
    
    this.localStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: this.selectedCamera
          },
          audio: {
            deviceId: this.selectedMic,
            echoCancellation: true
          }
        }
    
    );
  
    // this.localStream = stream;
    
    this.createRoom();
    
    
    
  }


  public getDataChannel():RTCDataChannel {
    return this.dataChannel;
  }
  public setOnMessageCallback(callback) {
    this.onMessageCallback = callback;
  }
  public getConnectionStatus() {
    return this.connectionStatus;
  }

  public playPreRing():void {
    this.preRing.play();
  }
  public stopPrering(): void{
    this.preRing.pause();
  }
  private getConnectedDevices(type, callback) {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
          console.log("****"+type+"****");
          
            const filtered = devices.filter(device => device.kind === type);
            callback(filtered);
        })
      .catch(error => {
        console.log("Error finding : "+type);
         
      }); 
  }
  
  private setupDevice(): void{

    this.connectionStatus = "Preparing...";

    this.getConnectedDevices('videoinput',
      cameras => {
        console.log('Cameras found', cameras)
        this.cameraArray = cameras;
        if (this.cameraArray.length > 0) {
        
          this.selectedCamera = this.cameraArray[0].deviceId;

          this.getConnectedDevices('audioinput',
            mics => {

              console.log('mics found', mics);
              this.micArray = mics;
              if (this.micArray.length > 0) {
                this.selectedMic = this.micArray[0].deviceId;

                this.openUserMedia(); 
              
              } else {
                this.noMediaCallback("mic", "No microphone attached to this device. Kindly attach one to complete this call.", "Got It");
                this.connectionStatus = "Unavailable";
              }//no mic
            }
          );
        } else {
          this.noMediaCallback("camera", "No webcam/camera attached to this device. Kindly attach one to complete this call.", "Got It");
          this.connectionStatus = "Unavailable";
        }//no camera
      }
    );

    
  }

  public setConnectionStatus(status:string): void{
    this.connectionStatus = status;
  }

  public callNow():void {
    this.setupDevice();
  }
  public async createRoom() {

    this.createPeerConnection();

    this.registerPeerConnectionListeners();

    this.createDataChannel("Chatting Channel");

    this.addDataChannelListeners();

    this.addTracks();

    this.getRemoteTracks();

    const collectionRef = this.roomCollection + '/' + this.roomId + '/' + this.callerCollection;
    
    this.setIceCandidates(collectionRef, this.callerIceDoc);

    this.createOffer(this.roomCollection, this.roomId);

    this.setAnswer(this.roomCollection, this.roomId);

    const collectionRefRemoteIce = this.roomCollection + '/' + this.roomId + '/' + this.calleeCollection;

    this.setRemoteIceCandidate(collectionRefRemoteIce, this.calleeIceDoc);
  }

  private createPeerConnection():void {
    this.peerConnection = new RTCPeerConnection(this.configuration);
  }
  private createDataChannel(channelName:string):void {

    this.dataChannel = this.peerConnection.createDataChannel(channelName, { ordered: true });
    
  }

  private addTracks(): void {
    
    this.localStream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, this.localStream);
    });
  }

  private getRemoteTracks(): void{

    this.peerConnection.addEventListener('track', event => {
      console.log('Got remote track..');
      event.streams[0].getTracks().forEach(track => {        
        this.remoteStream.addTrack(track);
      });
    });
  }

  private registerPeerConnectionListeners() {

    this.peerConnection.addEventListener('icegatheringstatechange', () => {
      console.log(
        'ICE gathering state changed: ' + this.peerConnection.iceGatheringState);
    });

    this.peerConnection.addEventListener('connectionstatechange', () => {
      console.log('Connection state change: ' + this.peerConnection.connectionState);
      this.connectionStatus = this.peerConnection.connectionState.toUpperCase();
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
      
      // this.dataChannel = event.channel;
      
      });
    
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
      this.onMessageCallback(event.data);
    });
  }

  private setIceCandidates(callerCandidateCollection:string, document:string): void{

    console.log("callerCandidateCollection : "+callerCandidateCollection);
    
    this.peerConnection.addEventListener('icecandidate', event => {
      if (!event.candidate) {
        console.log('Got final candidate!');
        return;
      }
      console.log('Got candidate.. ');

      document = (+Date.now()).toString();
      this.firestore.save(callerCandidateCollection, document, event.candidate.toJSON())
      .then(() => {
        console.log("Caller candidates added!");
        
      })
      .catch(error => {
        console.log("Error : caller candidates could not be added.");
      });

    });
  }

  private async createOffer(room:string, roomId:string){
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

    this.firestore.update(room, roomId, roomWithOffer)
      .then(() => {
        console.log("Room created with offer!");
        this.connectionStatus = "Connecting...";
        this.callStartCallback();
        
      })
      .catch(error => {
        this.connectionStatus = "Failed";
        this.stopPrering();
      });
    
  }

  private async setAnswer(room:string, roomId:string) {

    this.answerObs = this.firestore.getDocChanges(room, roomId)
      .subscribe(async(change) => {

        const type: string = change.type;
        const data: any = change.payload.data() as any;

        if (!this.peerConnection.currentRemoteDescription && data.answer) {
                console.log('Got remote description..');
                const answer = new RTCSessionDescription(data.answer)
                this.peerConnection.setRemoteDescription(answer);
                // return { id, ...data };
              }
      });
  }

  private async setRemoteIceCandidate(calleeCandidateCollection:string, document:string) {

    this.remoteIceObs = this.firestore.getIceChangesCollection(calleeCandidateCollection)
      .subscribe(docChangeList => {

        docChangeList.forEach(async (change) => {
      
          // console.log("patient >>> 123 >> "+JSON.stringify(patient));
        
          switch (change.payload.type) {
          
            case "added":
              const ice = change.payload.doc.data() as any;
              if (ice) {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(ice))
                  .then(() => {
                    this.stopRinging();
                    this.conferenceCallback();
                  })
                .catch(error => {
                  console.log("Could not add this ice candidate");
                  
                });;
               
              }
              break;
            case "modified":
                     
              break;
            case "removed":
              break;
          
          }

        });

      });

  }

  public startRingTimer() {
    this.ringTimer = setTimeout(() => {
      this.audio.pause();
      this.setHostDisconnectAction(true);
      this.timeUpCallback();
      clearTimeout( this.ringTimer);
    }, 35000);

    this.audio.play();
  }

  public stopRinging() {
    if (this.ringTimer) {
      this.audio.pause();
      clearTimeout( this.ringTimer);
    }
   
  }

  public unsubscribe() {
    if (this.remoteIceObs) {
      this.remoteIceObs.unsubscribe();
    }
    if (this.answerObs) {
      this.answerObs.unsubscribe();
    }
    this.hangUp();
  }
  
  public async hangUp() {
    const tracks = this.localStream.getTracks();
    tracks.forEach(track => {
      track.stop();
    });


    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
    }

    if (this.peerConnection) {
      this.peerConnection.close();
    };

    // this.remoteIceCollectionRef.forEach(element => {
    //   let remoteCollectionref = this.roomCollection + "/" + this.roomId + "/" + this.callerCollection;
    //   this.firestore.delete(remoteCollectionref, element);
    // });
    // this.iceCollectionRef.forEach(element => {
    //   let collectionref = this.roomCollection + "/" + this.roomId + "/" + this.calleeCollection;
    //   this.firestore.delete(collectionref, element);
    // });

    // this.remoteIceCollectionRef = [];
    // this.iceCollectionRef = [];
  }
  
}



// this.getConnectedDevices('audiooutput',
                //   speakers => {
                //     console.log('speakers found', speakers);

                //     if (this.speakerArray.length > 0) {
                //       this.speakerArray = speakers;
                        
                      
                //     } else {
                //       this.noMediaCallback("mic", "No speaker attached to this device. Kindly attach one to complete this call.", "Got It");
                //     }//no speaker
                    

                //   }
                // );