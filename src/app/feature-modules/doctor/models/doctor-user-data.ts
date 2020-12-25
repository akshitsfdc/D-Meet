

export class DoctorUserData {

    private email:string;
    private name:string;
    private picUrl:string;
    private userId:string;
    private profileId:string;
    private registrationNumber:string;
    private experience:number;
    private degree:string;
    private speciality:string;
    private clinicName:string;
    private fullClinicAddress:string;
    private country:string;
    private state:string;
    private city:string;
    private varified:boolean;
    private about:string;
    private doctor:boolean;
    private registrationLocalTimeStapm:number;
    private kycSubmitted:boolean;
    private latitude:number;
    private longitude:number;
    private geoPoints:firebase.firestore.GeoPoint;
    private diseaseSpecialist:string[]=[];



    constructor(){}


    public getGeoPoints(): firebase.firestore.GeoPoint {
        return this.geoPoints;
    }

    public setGeoPoints(geoPoints: firebase.firestore.GeoPoint): void {
        this.geoPoints = geoPoints;
    }

    
    public getDiseaseSpecialist(): string[] {
        return this.diseaseSpecialist;
    }

    public setDiseaseSpecialist(diseaseSpecialist: string[]): void {
        this.diseaseSpecialist = diseaseSpecialist;
    }

    public getLatitude(): number {
        return this.latitude;
    }

    public setLatitude(latitude: number): void {
        this.latitude = latitude;
    }

    public getLongitude(): number {
        return this.longitude;
    }

    public setLongitude(longitude: number): void {
        this.longitude = longitude;
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

    public isDoctor(): boolean {
        return this.doctor;
    }

    public setDoctor(doctor: boolean): void {
        this.doctor = doctor;
    }

    public getRegistrationLocalTimeStapm(): number {
        return this.registrationLocalTimeStapm;
    }

    public setRegistrationLocalTimeStapm(registrationLocalTimeStapm: number): void {
        this.registrationLocalTimeStapm = registrationLocalTimeStapm;
    }
        

}
