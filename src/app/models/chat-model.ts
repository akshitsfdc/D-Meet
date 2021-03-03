
export class ChatModel {

    private senderLabel: string;
    private senderId: string;
    private msg: string;
    private time: number;
    private timeLabel: string;

    constructor() { }
    
    public getTimeLabel(): string {
        return this.timeLabel;
    }

    public setTimeLabel(timeLabel: string): void {
        this.timeLabel = timeLabel;
    }

    public getSenderLabel(): string {
        return this.senderLabel;
    }

    public setSenderLabel(senderLabel: string): void {
        this.senderLabel = senderLabel;
    }

    public getSenderId(): string {
        return this.senderId;
    }

    public setSenderId(senderId: string): void {
        this.senderId = senderId;
    }

    public getMsg(): string {
        return this.msg;
    }

    public setMsg(msg: string): void {
        this.msg = msg;
    }

    public getTime(): number {
        return this.time;
    }

    public setTime(time: number): void {
        this.time = time;
    }




}