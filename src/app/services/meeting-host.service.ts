import { FirestoreService } from 'src/app/services/firestore.service';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class MeetingHostService {

  private configuration:any = {
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

  private peerConnection: RTCPeerConnection;
  private dataChannel: RTCDataChannel;
  private localStream: MediaStream;
  private remoteStream: MediaStream;

  constructor(private firestore:FirestoreService) { }


  private getConnectedDevices(type, callback) {
    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            const filtered = devices.filter(device => device.kind === type);
            callback(filtered);
      }); 
  }

  private async openUserMedia(selectedCamera: string, selectedMic: string) {
    
    const stream = await navigator.mediaDevices.getUserMedia(
        { 
              video: {
                deviceId: selectedCamera
              },
              audio: {
                deviceId: selectedMic,
                echoCancellation: true
            }
        }
      );
     
  
    this.localStream = stream;
    // window.stream = stream; //for recording
    // this.remoteStream = this.localStream;
    // this.remoteStream = new MediaStream();

    
  }

  public createRoom() {
    
  }

  private createPeerConnection():void {
    this.peerConnection = new RTCPeerConnection(this.configuration);
  }
  private createDataChannel(channelName:string):void {

    this.dataChannel = this.peerConnection.createDataChannel("Chat Channel", { ordered: true });
    
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

    this.peerConnection.addEventListener('icecandidate', event => {
      if (!event.candidate) {
        console.log('Got final candidate!');
        return;
      }
      console.log('Got candidate.. ');

      this.firestore.save(callerCandidateCollection, document, event.candidate.toJSON())
      .then(() => {
      
      })
      .catch(error => {
      
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

    this.firestore.save(room, roomId, roomWithOffer)
      .then(() => {
      
      })
      .catch(error => {
      
      });
    
  }

  private async setAnswer(room:string, roomId:string) {

    this.firestore.getDocChanges(room, roomId)
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

    this.firestore.getDocChanges(calleeCandidateCollection, document)
      .subscribe(async(change) => {
        const type: string = change.type;
        const data: any = change.payload.data() as any;     
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
        
    });
  }

  
  
  
}
