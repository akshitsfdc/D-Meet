
export class MediaSignal {

    private mediaSignal: boolean;
    private videoOn: boolean;
    private audioOn: boolean;

    constructor() {
        this.setMediaSignal(true);
        this.setVideoOn(true);
        this.setAudioOn(true);
    }

    public isMediaSignal(): boolean {
        return this.mediaSignal;
    }

    public setMediaSignal(mediaSignal: boolean): void {
        this.mediaSignal = mediaSignal;
    }

    public isVideoOn(): boolean {
        return this.videoOn;
    }

    public setVideoOn(videoOn: boolean): void {
        this.videoOn = videoOn;
    }

    public isAudioOn(): boolean {
        return this.audioOn;
    }

    public setAudioOn(audioOn: boolean): void {
        this.audioOn = audioOn;
    }

}