

export class CallerModel {

    private answered: boolean;
    private newCall: boolean;
    private busy: boolean;
    private reject: boolean;
    private callerName: string;
    private callerId: string;
    private lastCallduration: number;
    private roomId:string;    

    constructor() {
        
    }

    public getRoomId(): string {
        return this.roomId;
    }

    public setRoomId(roomId: string): void {
        this.roomId = roomId;
    }
    
    public isReject(): boolean {
        return this.reject;
    }

    public setReject(reject: boolean): void {
        this.reject = reject;
    }
    public isAnswered(): boolean {
        return this.answered;
    }

    public setAnswered(answered: boolean): void {
        this.answered = answered;
    }

    public isNewCall(): boolean {
        return this.newCall;
    }

    public setNewCall(newCall: boolean): void {
        this.newCall = newCall;
    }

    public isBusy(): boolean {
        return this.busy;
    }

    public setBusy(busy: boolean): void {
        this.busy = busy;
    }

    public getCallerName(): string {
        return this.callerName;
    }

    public setCallerName(callerName: string): void {
        this.callerName = callerName;
    }

    public getCallerId(): string {
        return this.callerId;
    }

    public setCallerId(callerId: string): void {
        this.callerId = callerId;
    }


    


    public getLastCallduration(): number {
        return this.lastCallduration;
    }

    public setLastCallduration(lastCallduration: number): void {
        this.lastCallduration = lastCallduration;
    }
    

}