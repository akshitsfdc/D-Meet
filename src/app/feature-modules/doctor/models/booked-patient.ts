

export class BookedPatient {

    private name: string;
    private picUrl: string;
    private from: string;
    private phone:string;
    private status: string;
    private condition: string;
    private queuePlace: number;
    private bookingTime:number;
    private bookingId: string;
    private queueId:string;
    private doctorId:string;

    public getQueueId(): string {
        return this.queueId;
    }

    public setQueueId(queueId: string): void {
        this.queueId = queueId;
    }

    public getDoctorId(): string {
        return this.doctorId;
    }

    public setDoctorId(doctorId: string): void {
        this.doctorId = doctorId;
    }

    public getPhone(): string {
        return this.phone;
    }

    public setPhone(phone: string): void {
        this.phone = phone;
    }

    public getBookingTime(): number {
        return this.bookingTime;
    }

    public setBookingTime(bookingTime: number): void {
        this.bookingTime = bookingTime;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getPicUrl(): string {
        return this.picUrl;
    }

    public setPicUrl(picUrl: string): void {
        this.picUrl = picUrl;
    }

    public getFrom(): string {
        return this.from;
    }

    public setFrom(from: string): void {
        this.from = from;
    }

    public getStatus(): string {
        return this.status;
    }

    public setStatus(status: string): void {
        this.status = status;
    }

    public getCondition(): string {
        return this.condition;
    }

    public setCondition(condition: string): void {
        this.condition = condition;
    }

    public getQueuePlace(): number {
        return this.queuePlace;
    }

    public setQueuePlace(queuePlace: number): void {
        this.queuePlace = queuePlace;
    }

    public getBookingId(): string {
        return this.bookingId;
    }

    public setBookingId(bookingId: string): void {
        this.bookingId = bookingId;
    }

}
