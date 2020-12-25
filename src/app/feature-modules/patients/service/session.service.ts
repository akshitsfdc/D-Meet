import { Injectable } from "@angular/core";


@Injectable({
    providedIn: 'root'
})

export class SessionService {

    private sharedData:any;

    constructor() {
    }


    public getSharedData(): any {
        return this.sharedData;
    }

    public setSharedData(sharedData: any): void {
        this.sharedData = sharedData;
    }


}