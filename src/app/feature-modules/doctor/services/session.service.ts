import { UtilsService } from './../../../services/utils.service';
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

  constructor(private utils:UtilsService) {
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

    this.changeQueueStatus(this.queues);

  }
  public getSharedData(): any {
    return this.sharedData;
  }

  public setSharedData(sharedData: any): void {
      this.sharedData = sharedData;
  }

  private changeQueueStatus(queues:QueueModel[]):void{

    queues.forEach(queue => {
        if(this.utils.isWithinTimeFrame(queue.getBookingStarting(), queue.getBookingEnding(), 'ist')){
          queue.setStatus('booking');
        }
        if(this.utils.isWithinTimeFrame(queue.getConsultingStarting(), queue.getConsultingEnding(), 'ist')){
          queue.setStatus('live');
        }
  
        if(this.utils.getTriggerTime(queue.getBookingStarting(), 'ist') !== -1){
          setTimeout(() => {
            this.updateQueue(queue);
          }, this.utils.getTriggerTime(queue.getBookingStarting(), 'ist'));
        }

        if(this.utils.getTriggerTime(queue.getBookingEnding(), 'ist') !== -1){
          setTimeout(() => {
            this.updateQueue(queue);
          }, this.utils.getTriggerTime(queue.getBookingEnding(), 'ist'));
        }
        if(this.utils.getTriggerTime(queue.getConsultingStarting(), 'ist') !== -1){
          setTimeout(() => {
            this.updateQueue(queue);
          }, this.utils.getTriggerTime(queue.getConsultingStarting(), 'ist'));
        }
        if(this.utils.getTriggerTime(queue.getConsultingEnding(), 'ist') !== -1){
          setTimeout(() => {
            this.updateQueue(queue, true);
          }, this.utils.getTriggerTime(queue.getConsultingEnding(), 'ist'));
        }
    });
  }

  private updateQueue(queue:QueueModel, end?:boolean){

    console.log('updateQueue >> ');

    if(end){
      queue.setStatus('scheduled');
      return;
    }
    if(this.utils.isWithinTimeFrame(queue.getBookingStarting(), queue.getBookingEnding(), 'ist')){
      queue.setStatus('booking');
    }
    if(this.utils.isWithinTimeFrame(queue.getConsultingStarting(), queue.getConsultingEnding(), 'ist')){
      queue.setStatus('live');
    }

  }

}
