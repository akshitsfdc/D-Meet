import { DoctorUserData } from 'src/app/models/doctor-user-data';
import { QueueModel } from 'src/app/models/queue-model';



export class SearchedDoctor {

    private doctor:DoctorUserData;
    private queues:QueueModel[];
    private queueInitialized:boolean;
    private queueLoading:boolean;

    constructor(){
        this.queues = [];
        this.queueInitialized = false;
        this.queueLoading = false;

    }
   
    public isQueueLoading(): boolean {
        return this.queueLoading;
    }

    public setQueueLoading(queueLoading: boolean): void {
        this.queueLoading = queueLoading;
    }

    public getDoctor(): DoctorUserData {
        return this.doctor;
    }

    public setDoctor(doctor: DoctorUserData): void {
        this.doctor = doctor;
    }

    public getQueues(): QueueModel[] {
        return this.queues;
    }

    public setQueues(queues: QueueModel[]): void {
        this.queues = queues;
    }

    public isQueueInitialized(): boolean {
        return this.queueInitialized;
    }

    public setQueueInitialized(queueInitialized: boolean): void {
        this.queueInitialized = queueInitialized;
    }
    
}