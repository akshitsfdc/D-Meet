import { BookedPatient } from './booked-patient';


export class Bookings {

    private queueId:string;
    private patientList:BookedPatient[] = [];
    private initialized:boolean = false;

    constructor(){
    }


    public isInitialized(): boolean {
        return this.initialized;
    }

    public setInitialized(initialized: boolean): void {
        this.initialized = initialized;
    }
    public getQueueId(): string {
        return this.queueId;
    }

    public setQueueId(queueId: string): void {
        this.queueId = queueId;
    }

    public getPatientList(): BookedPatient[] {
        return this.patientList;
    }

    public setPatientList(patientList: BookedPatient[]): void {
        this.patientList = patientList;
    }




}