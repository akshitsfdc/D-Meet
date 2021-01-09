import { Injectable } from "@angular/core";
import { PatientUserData } from "src/app/models/patient-user-data";


@Injectable({
    providedIn: 'root'
})

export class SessionService {

    private sharedData: any;
    private userData: PatientUserData;



    constructor() {
    }


    public getUserData(): PatientUserData {
        return this.userData;
    }

    public setUserData(userData: PatientUserData): void {
        this.userData = userData;
    }
    
    public getSharedData(): any {
        return this.sharedData;
    }

    public setSharedData(sharedData: any): void {
        this.sharedData = sharedData;
    }


}