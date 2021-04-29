

export class Prescription {

    private email:string;
    private name:string;
    private doctorId:string;
    private picUrl:string;
    private phoneNumber: string;
    private profileId: string;
    private degree:string;
    private speciality:string;
    private clinicName:string;
    private fullClinicAddress: string;
    
    private patientName: string;
    private patientId: string;
    private patientAddress: string;
    private age: number;
    private patientgender: string;

    private writtenTime:number;
    private edited: boolean;
    private lastEditedTime: number;

    public prescription: string;

    private bookingId: string;
    private roomId: string;


    constructor(){}

    public getEmail(): string {
        return this.email;
    }

    public setEmail(email: string): void {
        this.email = email;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getDoctorId(): string {
        return this.doctorId;
    }

    public setDoctorId(doctorId: string): void {
        this.doctorId = doctorId;
    }

    public getPicUrl(): string {
        return this.picUrl;
    }

    public setPicUrl(picUrl: string): void {
        this.picUrl = picUrl;
    }

    public getPhoneNumber(): string {
        return this.phoneNumber;
    }

    public setPhoneNumber(phoneNumber: string): void {
        this.phoneNumber = phoneNumber;
    }

    public getProfileId(): string {
        return this.profileId;
    }

    public setProfileId(profileId: string): void {
        this.profileId = profileId;
    }

    public getDegree(): string {
        return this.degree;
    }

    public setDegree(degree: string): void {
        this.degree = degree;
    }

    public getSpeciality(): string {
        return this.speciality;
    }

    public setSpeciality(speciality: string): void {
        this.speciality = speciality;
    }

    public getClinicName(): string {
        return this.clinicName;
    }

    public setClinicName(clinicName: string): void {
        this.clinicName = clinicName;
    }

    public getFullClinicAddress(): string {
        return this.fullClinicAddress;
    }

    public setFullClinicAddress(fullClinicAddress: string): void {
        this.fullClinicAddress = fullClinicAddress;
    }

    public getPatientName(): string {
        return this.patientName;
    }

    public setPatientName(patientName: string): void {
        this.patientName = patientName;
    }

    public getPatientId(): string {
        return this.patientId;
    }

    public setPatientId(patientId: string): void {
        this.patientId = patientId;
    }

    public getPatientAddress(): string {
        return this.patientAddress;
    }

    public setPatientAddress(patientAddress: string): void {
        this.patientAddress = patientAddress;
    }

    public getAge(): number {
        return this.age;
    }

    public setAge(age: number): void {
        this.age = age;
    }

    public getPatientgender(): string {
        return this.patientgender;
    }

    public setPatientgender(patientgender: string): void {
        this.patientgender = patientgender;
    }

    public getWrittenTime(): number {
        return this.writtenTime;
    }

    public setWrittenTime(writtenTime: number): void {
        this.writtenTime = writtenTime;
    }

    public isEdited(): boolean {
        return this.edited;
    }

    public setEdited(edited: boolean): void {
        this.edited = edited;
    }

    public getLastEditedTime(): number {
        return this.lastEditedTime;
    }

    public setLastEditedTime(lastEditedTime: number): void {
        this.lastEditedTime = lastEditedTime;
    }

    public getPrescription(): string {
        return this.prescription;
    }

    public setPrescription(prescription: string): void {
        this.prescription = prescription;
    }

    public getBookingId(): string {
        return this.bookingId;
    }

    public setBookingId(bookingId: string): void {
        this.bookingId = bookingId;
    }

    public getRoomId(): string {
        return this.roomId;
    }

    public setRoomId(roomId: string): void {
        this.roomId = roomId;
    }




    
}