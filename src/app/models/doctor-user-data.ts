import { DocumentReference } from '@angular/fire/firestore';


export class DoctorUserData {

    private email: string;
    private firstName: string;
    private lastName: string;
    private gender: string;
    private picUrl: string;
    private userId: string;
    private phoneNumber: string;
    private profileId: string;
    private registrationNumber: string;
    private experience: number;
    private degree: string;
    private speciality: string;
    private clinicName: string;
    private fullClinicAddress: string;
    private country: string;
    private state: string;
    private city: string;
    private varified: boolean;
    private about: string;
    private registrationLocalTimeStapm: number;
    private kycSubmitted: boolean;
    // private latitude:number;
    // private longitude:number;
    private nearbyAddress: string;
    private coordinates: firebase.default.firestore.GeoPoint;
    private status: string;
    private doctor: boolean;


    constructor() {
    }


    public isDoctor(): boolean {
        return this.doctor;
    }

    public setDoctor(doctor: boolean): void {
        this.doctor = doctor;
    }

    public getPhoneNumber(): string {
        return this.phoneNumber;
    }

    public setPhoneNumber(phoneNumber: string): void {
        this.phoneNumber = phoneNumber;
    }

    public getStatus(): string {
        return this.status;
    }

    public setStatus(status: string): void {
        this.status = status;
    }

    public getCoordinates(): firebase.default.firestore.GeoPoint {
        return this.coordinates;
    }

    public setCoordinates(coordinates: firebase.default.firestore.GeoPoint): void {
        this.coordinates = coordinates;
    }


    public getNearbyAddress(): string {
        return this.nearbyAddress;
    }

    public setNearbyAddress(nearbyAddress: string): void {
        this.nearbyAddress = nearbyAddress;
    }

    public isKycSubmitted(): boolean {
        return this.kycSubmitted;
    }

    public setKycSubmitted(kycSubmitted: boolean): void {
        this.kycSubmitted = kycSubmitted;
    }

    public getEmail(): string {
        return this.email;
    }

    public setEmail(email: string): void {
        this.email = email;
    }

    public getFirstName(): string {
        return this.firstName;
    }

    public setFirstName(firstName: string): void {
        this.firstName = firstName;
    }

    public getLastName(): string {
        return this.lastName;
    }

    public setLastName(lastName: string): void {
        this.lastName = lastName;
    }
    public getGender(): string {
        return this.gender;
    }

    public setGender(gender: string): void {
        this.gender = gender;
    }

    public getPicUrl(): string {
        return this.picUrl;
    }

    public setPicUrl(picUrl: string): void {
        this.picUrl = picUrl;
    }

    public getUserId(): string {
        return this.userId;
    }

    public setUserId(userId: string): void {
        this.userId = userId;
    }

    public getProfileId(): string {
        return this.profileId;
    }

    public setProfileId(profileId: string): void {
        this.profileId = profileId;
    }


    public getRegistrationNumber(): string {
        return this.registrationNumber;
    }

    public setRegistrationNumber(registrationNumber: string): void {
        this.registrationNumber = registrationNumber;
    }

    public getExperience(): number {
        return this.experience;
    }

    public setExperience(experience: number): void {
        this.experience = experience;
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

    public getCountry(): string {
        return this.country;
    }

    public setCountry(country: string): void {
        this.country = country;
    }

    public getState(): string {
        return this.state;
    }

    public setState(state: string): void {
        this.state = state;
    }

    public getCity(): string {
        return this.city;
    }

    public setCity(city: string): void {
        this.city = city;
    }

    public isVarified(): boolean {
        return this.varified;
    }

    public setVarified(varified: boolean): void {
        this.varified = varified;
    }

    public getAbout(): string {
        return this.about;
    }

    public setAbout(about: string): void {
        this.about = about;
    }

    public getRegistrationLocalTimeStapm(): number {
        return this.registrationLocalTimeStapm;
    }

    public setRegistrationLocalTimeStapm(registrationLocalTimeStapm: number): void {
        this.registrationLocalTimeStapm = registrationLocalTimeStapm;
    }


}
