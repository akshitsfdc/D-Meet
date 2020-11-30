import { Injectable } from '@angular/core';
import { DoctorUserData } from '../models/doctor-user-data';
import { QueueModel } from '../models/queue-model';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private userData:DoctorUserData;
  private sharedData:any;

  
  private queues:QueueModel[];

  constructor() {
    this.userData = new DoctorUserData();
    this.queues = [];
   }

   public getUserData(): DoctorUserData {
    return this.userData;
  }

  public setUserData(userData: DoctorUserData): void {
      this.userData = userData;
  }

  public getQueues(): QueueModel[] {
    return this.queues;
  }

  public setQueues(queues: QueueModel[]): void {
    this.queues = queues;
  }
  public getSharedData(): any {
    return this.sharedData;
  }

  public setSharedData(sharedData: any): void {
      this.sharedData = sharedData;
  }
  private getTimeString(milliseconds:number):string{
    return new Date(milliseconds).toLocaleDateString();
  }


}
