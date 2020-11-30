

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
    private loading:boolean;

   
    constructor(){}

    
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
