import { R } from '@angular/cdk/keycodes';
import { Injectable } from '@angular/core';
import { Action, DocumentSnapshot } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import { FirestoreService } from 'src/app/services/firestore.service';
import adapter from 'webrtc-adapter';

@Injectable()
export class MeetingClientService {

  private remoteIceObs: Subscription = null;
  private offerObs: Subscription = null;

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

  private connectionStatus: string;

  private selectedCamera: string;
  private selectedMic: string;
  private conferenceCallback: any;

  private iceCollectionRef: string[] = [];
  private remoteIceCollectionRef: string[] = [];
  
  private onMessageCallback: any;
  private onDataChannelOpenCallback: any;
  private noMediaCallback: any;

  constructor(private firestore: FirestoreService) { 

    this.roomCollection = "meeting_rooms";
    this.callerCollection = "caller_candidates";
    this.calleeCollection = "callee_candidates"

    this.audio.src = "/assets/audio/ringing.wav";
    this.audio.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
    }, false);
    
  }


  public setDataChannelOnOpenCallback(callback):void {
    this.onDataChannelOpenCallback = callback;
  }
  
  public setNoMediaCallback(noMediaCallback):void {
    this.noMediaCallback = noMediaCallback;
  }
  public getDataChannel():RTCDataChannel {
    return this.dataChannel;
  }
  public setOnMessageCallback(callback) {
    this.onMessageCallback = callback;
  }

  public setCallBack(callnback:any): void{
    this.conferenceCallback = callnback;
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



  private async openUserMedia() {
    
    const stream = await navigator.mediaDevices.getUserMedia({
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
  
    this.localStream = stream;

    this.joinRoom();



    
  }


  private getConnectedDevices(type, callback) {
    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
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

  public getConnectionStatus() {
    return this.connectionStatus;
  }

  public pickupNow():void {
    this.setupDevice();
  }

  public joinRoom() {

    this.createPeerConnection();

    this.registerPeerConnectionListeners();

    this.addTracks();

    this.getRemoteTracks();

    const collectionRef = this.roomCollection + '/' + this.roomId + '/' + this.calleeCollection;
    
    this.setIceCandidates(collectionRef, this.calleeIceDoc);

    this.fetchOffer(this.roomCollection, this.roomId);

    const collectionRefRemoteIce = this.roomCollection + '/' + this.roomId + '/' + this.callerCollection;
    this.setRemoteIceCandidate(collectionRefRemoteIce, this.callerIceDoc);

  }

  private createPeerConnection():void {
    this.peerConnection = new RTCPeerConnection(this.configuration);
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
      console.log('ICE connection state change:..datachannel ' + this.peerConnection.iceConnectionState);
      
    
    this.dataChannel = event.channel;

    this.addDataChannelListeners();
    
    
    });
    
  }


  private addDataChannelListeners(){

    // Enable textarea and button when opened
   this.dataChannel.addEventListener('open', event => {
     console.log("DataChannel opened!");

       this.onDataChannelOpenCallback();
     
      });
      this.dataChannel.addEventListener('close', event => {
        console.log("DataChannel closed!");
    });

    this.dataChannel.addEventListener('message', event => {
      this.onMessageCallback(event.data);
    });
  }

  private setIceCandidates(calleeCandidateCollection:string, document:string): void{

    this.peerConnection.addEventListener('icecandidate', event => {
      if (!event.candidate) {
        console.log('Got final candidate!');
        return;
      }
      console.log('Got candidate..');
      document = (+Date.now()).toString();
      this.iceCollectionRef.push(document);
      this.firestore.save(calleeCandidateCollection, document, event.candidate.toJSON())
      .then(() => {
        console.log("Callee candidates added!");
      })
      .catch(error => {
        console.log("error adding callee candidate.");
        
      });

    });
  }

  private async createAnswer(room: string, roomId: string) {
    

    

    const answer = await this.peerConnection.createAnswer()
      // .then(() => {
      //   console.log("Answer sdp created");
        
      // })
      // .catch(error => {
      //   console.log("Error creating answer sdp");
        
      // });
    
      console.log("Answer sdp created : "+answer);
    // console.log('Created answer..');
    
    await this.peerConnection.setLocalDescription(answer)
      .then(() => {
        console.log("added  answer sdp.");
      })
      .catch(error => {
        console.log("could not add answer sdp");
        this.connectionStatus = "Failed";
        
      });
    
    const roomWithAnswer = {
      answer: {
        type: answer.type,
        sdp: answer.sdp,
      },
    };
    
    

    await this.firestore.update(room, roomId, roomWithAnswer)
      .then(() => {
        console.log("answer added!");
        
      })
      .catch(error => {
        this.connectionStatus = "Failed";
      });
    
  }

  private async fetchOffer(room:string, roomId:string) {

    this.connectionStatus = "Connecting...";

    this. offerObs = this.firestore.getDocChanges(room, roomId)
    .subscribe(async(change) => {

      const type: string = change.type;
      const data: any = change.payload.data() as any;

      
        

      if (!this.peerConnection.currentRemoteDescription && data.offer) {
        console.log('Got remote description..offer');
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        this.createAnswer(room, roomId);
              // return { id, ...data };              
    }
    });
      
  }
  private async setRemoteIceCandidate(callerCandidateCollection:string, document:string) {
    
    this.remoteIceObs = this.firestore.getIceChangesCollection(callerCandidateCollection)
      .subscribe(docChangeList => {

       

        docChangeList.forEach(async (change) => {
          switch (change.payload.type) {
            case "added":
              const ice = change.payload.doc.data() as any;
              this.remoteIceCollectionRef.push(change.payload.doc.id);
                
              if (ice) {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(ice))
                  .then(() => {
                   
                    this.conferenceCallback();
                  })
                  .catch(error => {
                    console.log("Could not add this ice candidate");
                    
                  });
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

  public unsubscribe() {
    if (this.remoteIceObs) {
      this.remoteIceObs.unsubscribe();
    }
    if (this.offerObs) {
      this.offerObs.unsubscribe();
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

    this.remoteIceCollectionRef = [];
    this.iceCollectionRef = [];
  }
}
