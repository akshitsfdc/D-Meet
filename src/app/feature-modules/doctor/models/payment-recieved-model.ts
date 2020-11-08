

export class PaymentRecievedModel{

    private payeeName:string;
    private payeeEmail:string;
    private payeeContact:string;
    private amount:number;
    private currency:string;
    private convertedAmount:string;
    private queueId:string;
    private time:number;
    private convertedTime:string;
    private status:string;

    constructor(){}
    


    public getAmount(): number {
        return this.amount;
    }

    public setAmount(amount: number): void {
        this.amount = amount;
    }

    public getCurrency(): string {
        return this.currency;
    }

    public setCurrency(currency: string): void {
        this.currency = currency;
    }

    public getConvertedAmount(): string {
        return this.convertedAmount;
    }

    public setConvertedAmount(convertedAmount: string): void {
        this.convertedAmount = convertedAmount;
    }
    public getPayeeName(): string {
        return this.payeeName;
    }

    public setPayeeName(payeeName: string): void {
        this.payeeName = payeeName;
    }

    public getPayeeEmail(): string {
        return this.payeeEmail;
    }

    public setPayeeEmail(payeeEmail: string): void {
        this.payeeEmail = payeeEmail;
    }

    public getPayeeContact(): string {
        return this.payeeContact;
    }

    public setPayeeContact(payeeContact: string): void {
        this.payeeContact = payeeContact;
    }

    public getQueueId(): string {
        return this.queueId;
    }

    public setQueueId(queueId: string): void {
        this.queueId = queueId;
    }

    public getTime(): number {
        return this.time;
    }

    public setTime(time: number): void {
        this.time = time;
    }

    public getConvertedTime(): string {
        return this.convertedTime;
    }

    public setConvertedTime(convertedTime: string): void {
        this.convertedTime = convertedTime;
    }

    public getStatus(): string {
        return this.status;
    }

    public setStatus(status: string): void {
        this.status = status;
    }



}