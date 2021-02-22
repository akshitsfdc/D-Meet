import { FirestoreService } from 'src/app/services/firestore.service';
import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class MeetingHostService {

  private remoteIceObs: Subscription = null;
  private answerObs: Subscription = null;
  
  private configuration:any = {
    iceServers: [
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

  private conferenceCallback: any;
  private callStartCallback: any;
  

  constructor(private firestore: FirestoreService) { 

    this.roomCollection = "meeting_rooms";
    this.callerCollection = "caller_candidates";
    this.calleeCollection = "callee_candidates";

    this.audio.src = "/assets/audio/ringing.wav";
    this.audio.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
  }, false);
   

  }

  public setCallStartCallback(callStartCallback) {
    this.callStartCallback = callStartCallback;
  }
  public getLocalStream():MediaStream {
    return this.localStream;
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

  public setCallBack(callnback:any): void{
    this.conferenceCallback = callnback;
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
    

    console.log("this.localStream selectedCamera >> "+this.selectedCamera);
    console.log("this.localStream selectedMic >> "+this.selectedMic);
  
    // this.localStream = stream;
    this.createRoom();

    
    
    // window.stream = stream; //for recording
    // this.remoteStream = this.localStream;
    // this.remoteStream = new MediaStream();

    
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

        this.getConnectedDevices('audioinput',
        mics => {
          console.log('mics found', mics)
          this.micArray = mics;
          if(this.micArray.length > 0){
            this.selectedMic = this.micArray[0].deviceId;
           
            this.getConnectedDevices('audiooutput',
            speakers => {
              console.log('speakers found', speakers)
              this.speakerArray = speakers;
              this.openUserMedia();
             

            }
            );
          }
         }
        );
      }
     }
    );
    // this.getConnectedDevices('audioinput',
    // mics => {
    //   console.log('mics found', mics)
    //   this.micArray = mics;
    //   if(this.micArray.length > 0){
    //     this.selectedMic = this.micArray[0].deviceId;
    //     this.openUserMedia();
    //   }
    //  }
    // );
    this.getConnectedDevices('audiooutput',
    speakers => {
      console.log('speakers found', speakers)
      this.speakerArray = speakers;
     }
    );
  }

  public callNow():void {
    this.setupDevice();
  }
  public async createRoom() {

   // await this.openUserMedia();
    //await this.setupDevice();
    //ring
    //this.startRingTimer();

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
      // const message = event.data;
        
        // let messageObject = JSON.parse(message);

        // messageObject.he = true;

        // this.chats.push(messageObject);

        // this.getNewMessageCount(this.chats);
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
        this.callStartCallback();
        
      })
      .catch(error => {
      
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
      // this.callingInterfaceActive=false;
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
