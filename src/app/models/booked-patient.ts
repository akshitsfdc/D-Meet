import { PaymentInfo } from './payment-info';


export class BookedPatient {

    private name: string;
    private picUrl: string;
    private from: string;
    private patientId: string;
    private phone:string;
    private status: string;
    private queuePlace: number;
    private bookingTime:number;
    private bookingId: string;
    private queueId:string;
    private doctorId: string;
    private doctorName: string;
    private doctorPic: string;
    private paymentId: string;
    private orderId: string;
    private age: number;
    private signature: string;
    private dateString: string;
    private bookingTimeServer: number;
    private currentPatient: boolean;
    private processed: boolean;
    private processedTimeServer: number;
    private pending: boolean;
    private selfWaitingTime: number;
    private address: string;
    private gender: string;
    private cancelled: boolean;
    private cancelledBy: string;
    private postpond: BookingPostpond;

    constructor() { }
    

    public getPostpond(): BookingPostpond {
        return this.postpond;
    }

    public setPostpond(postpond: BookingPostpond): void {
        this.postpond = postpond;
    }

    public getProcessedTimeServer(): number {
        return this.processedTimeServer;
    }

    public setProcessedTimeServer(processedTimeServer: number): void {
        this.processedTimeServer = processedTimeServer;
    }

    
    public isCancelled(): boolean {
        return this.cancelled;
    }

    public setCancelled(cancelled: boolean): void {
        this.cancelled = cancelled;
    }

    public getCancelledBy(): string {
        return this.cancelledBy;
    }

    public setCancelledBy(cancelledBy: string): void {
        this.cancelledBy = cancelledBy;
    }


    public getDoctorName(): string {
        return this.doctorName;
    }

    public setDoctorName(doctorName: string): void {
        this.doctorName = doctorName;
    }

    public getDoctorPic(): string {
        return this.doctorPic;
    }

    public setDoctorPic(doctorPic: string): void {
        this.doctorPic = doctorPic;
    }
    
    public getGender(): string {
        return this.gender;
    }

    public setGender(gender: string): void {
        this.gender = gender;
    }
    
    public getAddress(): string {
        return this.address;
    }

    public setAddress(address: string): void {
        this.address = address;
    }

    public getSelfWaitingTime(): number {
        return this.selfWaitingTime;
    }

    public setSelfWaitingTime(selfWaitingTime: number): void {
        this.selfWaitingTime = selfWaitingTime;
    }

    public getBookingTimeServer(): number {
        return this.bookingTimeServer;
    }

    public setBookingTimeServer(bookingTimeServer: number): void {
        this.bookingTimeServer = bookingTimeServer;
    }
    
    public isProcessed(): boolean {
        return this.processed;
    }

    public setProcessed(processed: boolean): void {
        this.processed = processed;
    }

    public isPending(): boolean {
        return this.pending;
    }

    public setPending(pending: boolean): void {
        this.pending = pending;
    }

    public isCurrentPatient(): boolean {
        return this.currentPatient;
    }

    public setCurrentPatient(currentPatient: boolean): void {
        this.currentPatient = currentPatient;
    }


    public getDateString(): string {
        return this.dateString;
    }

    public setDateString(dateString: string): void {
        this.dateString = dateString;
    }

    public getAge(): number {
        return this.age;
    }

    public setAge(age: number): void {
        this.age = age;
    }

    public getPaymentId(): string {
        return this.paymentId;
    }

    public setPaymentId(paymentId: string): void {
        this.paymentId = paymentId;
    }

    public getOrderId(): string {
        return this.orderId;
    }

    public setOrderId(orderId: string): void {
        this.orderId = orderId;
    }

    public getSignature(): string {
        return this.signature;
    }

    public setSignature(signature: string): void {
        this.signature = signature;
    }
    
    public getPatientId(): string {
        return this.patientId;
    }

    public setPatientId(patientId: string): void {
        this.patientId = patientId;
    }

    // public getPaymentInfo(): PaymentInfo {
    //     return this.paymentInfo;
    // }

    // public setPaymentInfo(paymentInfo: PaymentInfo): void {
    //     this.paymentInfo = paymentInfo;
    // }

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
