

export class QueueModel {

    private fees: number;
    private status: string;
    private patientLimit: number;
    private bookingStarting: number;
    private bookingEnding: number;
    private consultingStarting: number;
    private consultingEnding: number;
    private bookedPatients: number;
    private queueId: string;
    private ownerId: string;


    constructor(){}


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
