
import { DoctorUserData } from '../../common-features/models/doctor-user-data';
import { QueueModel } from '../../common-features/models/queue-model';
export class SearchedDoctor {

    private doctor: DoctorUserData;
    private queues: QueueModel[];
    private queueInitialized: boolean;
    private queueLoading: boolean;

    private currentDoctor: DoctorUserData;




    constructor() {
        this.queues = [];
        this.queueInitialized = false;
        this.queueLoading = false;
        this.currentDoctor = null;
    }

    public getCurrentDoctor(): DoctorUserData {
        return this.currentDoctor;
    }

    public setCurrentDoctor(currentDoctor: DoctorUserData): void {
        this.currentDoctor = currentDoctor;
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

    public changeCurrentDoctor(doctor: DoctorUserData): void {

        if (doctor !== null && this.currentDoctor !== null) {


            this.currentDoctor.setAbout(doctor.getAbout());
            this.currentDoctor.setCity(doctor.getCity());
            this.currentDoctor.setClinicName(doctor.getClinicName());
            this.currentDoctor.setCoordinates(doctor.getCoordinates());
            this.currentDoctor.setCountry(doctor.getCountry());
            this.currentDoctor.setDegree(doctor.getDegree());
            this.currentDoctor.setDiseaseSpecialist(doctor.getDiseaseSpecialist());
            this.currentDoctor.setEmail(doctor.getEmail());
            this.currentDoctor.setExperience(doctor.getExperience());
            this.currentDoctor.setFirstName(doctor.getFirstName());
            this.currentDoctor.setLastName(doctor.getLastName());
            this.currentDoctor.setFullClinicAddress(doctor.getFullClinicAddress());
            this.currentDoctor.setGender(doctor.getGender());
            this.currentDoctor.setKycSubmitted(doctor.isKycSubmitted());
            this.currentDoctor.setNearbyAddress(doctor.getNearbyAddress());
            this.currentDoctor.setPicUrl(doctor.getPicUrl());
            this.currentDoctor.setProfileId(doctor.getProfileId());
            this.currentDoctor.setRegistrationLocalTimeStapm(doctor.getRegistrationLocalTimeStapm());
            this.currentDoctor.setRegistrationNumber(doctor.getRegistrationNumber());
            this.currentDoctor.setSpeciality(doctor.getSpeciality());
            this.currentDoctor.setVarified(doctor.isVarified());
            this.currentDoctor.setState(doctor.getState());
            this.currentDoctor.setUserId(doctor.getUserId());


        }
    }

}
