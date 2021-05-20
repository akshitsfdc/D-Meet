import { DocumentReference } from '@angular/fire/firestore';
import { BookedPatient } from "./booked-patient";




export class QueueModel {

    private currency:string;
    private fees: number;
    private status: string;
    private active:boolean;
    private patientLimit: number;
    private timePerPatient:number;
    private bookingStarting: number;
    private bookingEnding: number;
    private consultingStarting: number;
    private consultingEnding: number;
    private bookedPatients: number;
    private queueId: string;
    private ownerId: string;
    private holidayList:string[] = [];
    private loading: boolean;
    private type:string;
    private paymentOption: string;
    private bookingAvailable: boolean;
    private consultingStarted: boolean;
    private bookings: BookedPatient[];
    private currentPatient: BookedPatient;
    private nextNumber: string;
    private nextId: string;
    private myBooking: BookedPatient;
    private queueEnded: boolean;
    private docRef: DocumentReference;

  
    constructor() {
        this.bookings = [];
    }

    public getDocRef(): DocumentReference {
        return this.docRef;
    }

    public setDocRef(docRef: DocumentReference): void {
        this.docRef = docRef;
    }


    public isQueueEnded(): boolean {
        return this.queueEnded;
    }

    public setQueueEnded(queueEnded: boolean): void {
        this.queueEnded = queueEnded;
    }
    
    public getMyBooking(): BookedPatient {
        return this.myBooking;
    }
    
    public setMyBooking(myBooking: BookedPatient): void {
        this.myBooking = myBooking;
    }


    

    public getNextNumber(): string {
        return this.nextNumber;
    }

    public setNextNumber(nextNumber: string): void {
        this.nextNumber = nextNumber;
    }

    public getNextId(): string {
        return this.nextId;
    }

    public setNextId(nextId: string): void {
        this.nextId = nextId;
    }


    public getCurrentPatient(): BookedPatient {
        return this.currentPatient;
    }

    public setCurrentPatient(currentPatient: BookedPatient): void {
        this.currentPatient = currentPatient;
    }

    public getBookings(): BookedPatient[] {
        return this.bookings;
    }

    public setBookings(bookings: BookedPatient[]): void {
        this.bookings = bookings;
    }

    public isBookingAvailable(): boolean {
        return this.bookingAvailable;
    }

    public setBookingAvailable(bookingAvailable: boolean): void {
        this.bookingAvailable = bookingAvailable;
    }

    public isConsultingStarted(): boolean {
        return this.consultingStarted;
    }

    public setConsultingStarted(consultingStarted: boolean): void {
        this.consultingStarted = consultingStarted;
    }
    public getType(): string {
        return this.type;
    }

    public setType(type: string): void {
        this.type = type;
    }

    public getPaymentOption(): string {
        return this.paymentOption;
    }

    public setPaymentOption(paymentOption: string): void {
        this.paymentOption = paymentOption;
    }
    
    public getCurrency(): string {
        return this.currency;
    }

    public setCurrency(currency: string): void {
        this.currency = currency;
    }
    
    public getTimePerPatient(): number {
        return this.timePerPatient;
    }

    public setTimePerPatient(timePerPatient: number): void {
        this.timePerPatient = timePerPatient;
    }

    public isLoading(): boolean {
        return this.loading;
    }

    public setLoading(loading: boolean): void {
        this.loading = loading;
    }
    public isActive(): boolean {
        return this.active;
    }

    public setActive(active: boolean): void {
        this.active = active;
    }
    
    public getHolidayList(): string[] {
        return this.holidayList;
    }

    public setHolidayList(holidayList: string[]): void {
        this.holidayList = holidayList;
    }


    public getBookingStarting(): number {
        return this.bookingStarting;
    }

    public setBookingStarting(bookingStarting: number): void {
        this.bookingStarting = bookingStarting;
    }

    public getBookingEnding(): number {
        return this.bookingEnding;
    }

    public setBookingEnding(bookingEnding: number): void {
        this.bookingEnding = bookingEnding;
    }

    public getConsultingStarting(): number {
        return this.consultingStarting;
    }

    public setConsultingStarting(consultingStarting: number): void {
        this.consultingStarting = consultingStarting;
    }

    public getConsultingEnding(): number {
        return this.consultingEnding;
    }

    public setConsultingEnding(consultingEnding: number): void {
        this.consultingEnding = consultingEnding;
    }
    
    public getFees(): number {
        return this.fees;
    }

    public setFees(fees: number): void {
        this.fees = fees;
    }

    public getStatus(): string {
        return this.status;
    }

    public setStatus(status: string): void {
        this.status = status;
    }

    public getPatientLimit(): number {
        return this.patientLimit;
    }

    public setPatientLimit(patientLimit: number): void {
        this.patientLimit = patientLimit;
    }

   

    public getBookedPatients(): number {
        return this.bookedPatients;
    }

    public setBookedPatients(bookedPatients: number): void {
        this.bookedPatients = bookedPatients;
    }

    public getQueueId(): string {
        return this.queueId;
    }

    public setQueueId(queueId: string): void {
        this.queueId = queueId;
    }

    public getOwnerId(): string {
        return this.ownerId;
    }

    public setOwnerId(ownerId: string): void {
        this.ownerId = ownerId;
    }

}
