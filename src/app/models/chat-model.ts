
export class ChatModel {

    private senderLabel: string;
    private senderId: string;
    private msg: string;
    private time: number;
    private timeLabel: string;
    private read: boolean;

   


    constructor() { }
    
    public isRead(): boolean {
        return this.read;
    }

    public setRead(read: boolean): void {
        this.read = read;
    }
    
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