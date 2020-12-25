import { Injectable } from '@angular/core';
import { start } from 'repl';
import { QueueModel } from '../models/queue-model';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  public millisToTimeString(milliseconds:number):string{

    milliseconds -= 5.5 * 3600000; //for IST

    return new Date(milliseconds).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

  } 
  public millisToDateString(milliseconds:number):string{
    return new Date(milliseconds).toLocaleDateString();
  } 

  public get24Time(milliseconds:number){
    let date:Date = new Date(milliseconds);
    const hr = date.getUTCHours();
    const mi = date.getUTCMinutes();
    return hr+':'+mi;
  }
  public getISTMilliseconds(milliseconds:number):number{
    milliseconds -= 5.5 * 3600000;
    return milliseconds;
  }
  public getDay(milliseconds:number):string{

    milliseconds -= 5.5 * 3600000; //for IST

    let week:string[] = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return week[new Date(milliseconds).getDay()];
  }

  public initCap(str:string):string{
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  public capitalize(str:string):string{
    return str.toUpperCase();
  }
  public getWorkingDays(holidays:string[]):string[]{

    let week:string[] = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    holidays.forEach(element => {
      const index = week.indexOf(element, 0);
      if (index > -1) {
        week.splice(index, 1);
      }
    });

    return week;
  }
  public isWithinTimeFrame(startMs:number | 0, endMs:number | 0, type?:string):boolean{

    const currentTime:number = this.getMillisFromDate(new Date());

     if(currentTime <= endMs && currentTime >= startMs){
      return true;
    }else{
      return false;
    }

  }
  public getTriggerTime(milliseconds:number, type?:string):number{

    if(milliseconds === 0 || milliseconds === undefined){
      return 10;
    }
    
    const currentMillis = this.getMillisFromDate(new Date());

    console.log(milliseconds - currentMillis);

    if(currentMillis >= milliseconds){
      return -1;
    }

    return (milliseconds - currentMillis);
  }

  getTimeDifference(from:number):number{

     const nowMills:number = this.getMillisFromDate(new Date());

     const difference:number = nowMills - from;
  
     return difference;

  }
  getDateDigits(millis:number):string{

    const seconds:number = millis/1000;
    const minutes:number = seconds/60;

    return  Math.floor(minutes/60)+'h : '+ Math.floor(minutes%60)+'m';
  }
  private getMillisFromDate(date:Date):number{
    return ( ((+date.getHours()) * 60 * 60)  + ((+date.getMinutes()) * 60)) *1000;
  }




  //
  public changeQueueStatus(queues:QueueModel[]):void{

    queues.forEach(queue => {
        if(this.isWithinTimeFrame(queue.getBookingStarting(), queue.getBookingEnding(), 'ist')){
          queue.setStatus('booking');
        }
        if(this.isWithinTimeFrame(queue.getConsultingStarting(), queue.getConsultingEnding(), 'ist')){
          queue.setStatus('live');
        }
  
        if(this.getTriggerTime(queue.getBookingStarting(), 'ist') !== -1){
          setTimeout(() => {
            this.updateQueue(queue);
          }, this.getTriggerTime(queue.getBookingStarting(), 'ist'));
        }

        if(this.getTriggerTime(queue.getBookingEnding(), 'ist') !== -1){
          setTimeout(() => {
            this.updateQueue(queue);
          }, this.getTriggerTime(queue.getBookingEnding(), 'ist'));
        }
        if(this.getTriggerTime(queue.getConsultingStarting(), 'ist') !== -1){
          setTimeout(() => {
            this.updateQueue(queue);
          }, this.getTriggerTime(queue.getConsultingStarting(), 'ist'));
        }
        if(this.getTriggerTime(queue.getConsultingEnding(), 'ist') !== -1){
          setTimeout(() => {
            this.updateQueue(queue, true);
          }, this.getTriggerTime(queue.getConsultingEnding(), 'ist'));
        }
    });
  }

  private updateQueue(queue:QueueModel, end?:boolean){

    console.log('updateQueue >> ');

    if(end){
      queue.setStatus('scheduled');
      return;
    }
    if(this.isWithinTimeFrame(queue.getBookingStarting(), queue.getBookingEnding(), 'ist')){
      queue.setStatus('booking');
    }
    if(this.isWithinTimeFrame(queue.getConsultingStarting(), queue.getConsultingEnding(), 'ist')){
      queue.setStatus('live');
    }

  }
}
