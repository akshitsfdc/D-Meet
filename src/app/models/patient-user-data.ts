export class PatientUserData {

    private email:string;
    private firstName:string;
    private lastName:string;
    private gender:string;
    private age:number;
    private picUrl:string;
    private userId:string;
    private registrationLocalTimeStapm:number;

    constructor(){}
    
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

    public getAge(): number {
        return this.age;
    }

    public setAge(age: number): void {
        this.age = age;
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

    public getRegistrationLocalTimeStapm(): number {
        return this.registrationLocalTimeStapm;
    }

    public setRegistrationLocalTimeStapm(registrationLocalTimeStapm: number): void {
        this.registrationLocalTimeStapm = registrationLocalTimeStapm;
    }


}