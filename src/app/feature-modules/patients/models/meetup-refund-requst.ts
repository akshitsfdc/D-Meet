import { DocumentReference } from '@angular/fire/firestore';
export class MeetupRefundRequest {

    private amount: number;
    private patientName: string;
    private requestTime: number;
    private bookingRef: DocumentReference;
    private status: string;
    private reason: string;


    constructor() { }

    public getAmount(): number {
        return this.amount;
    }

    public setAmount(amount: number): void {
        this.amount = amount;
    }

    public getPatientName(): string {
        return this.patientName;
    }

    public setPatientName(patientName: string): void {
        this.patientName = patientName;
    }

    public getRequestTime(): number {
        return this.requestTime;
    }

    public setRequestTime(requestTime: number): void {
        this.requestTime = requestTime;
    }

    public getBookingRef(): DocumentReference {
        return this.bookingRef;
    }

    public setBookingRef(bookingRef: DocumentReference): void {
        this.bookingRef = bookingRef;
    }

    public getStatus(): string {
        return this.status;
    }

    public setStatus(status: string): void {
        this.status = status;
    }

    public getReason(): string {
        return this.reason;
    }

    public setReason(reason: string): void {
        this.reason = reason;
    }

}