import { HttpService } from './http.service';
import { Injectable } from '@angular/core';
import { start } from 'repl';
import { QueueModel } from '../models/queue-model';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {


  // { "timestapmIST": 1609694762338, "timestapmUTC": 1609674962338, "date": "3 0 2021" }
  
  constructor(private http:HttpService) { }

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

    let currentTime: number = this.getMillisFromDate(new Date());
    
    // await this.http.getServerDate("serverDate")
    // .then(dateObjs => {
    //   currentTime = dateObjs.timestapmIST;
    //   console.log("currentTime 1 "+currentTime);
    // })
    // .catch(error => {
      
    //   //error
    // })
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

    let nowMills: number = this.getMillisFromDate(new Date());;

    // this.getIstTimeServer()
    //   .then(timeStamp => {
    
    //     nowMills = this.getMillisFromDate(new Date(timeStamp));

    //   })
    //   .catch(error => {
      
    //   });
      
    const difference: number = nowMills - from;

     return difference;

  }

  getDateDigits(millis:number):string{

    const seconds:number = millis/1000;
    const minutes:number = seconds/60;

    return  Math.floor(minutes/60)+'h : '+ Math.floor(minutes%60)+'m';
  }

  private getMillisFromDate(date: Date): number{
    
    console.log("hr : " + date.getHours());
    console.log("minutes : " + date.getMinutes());
    
    return (((+date.getHours()) * 60 * 60) + ((+date.getMinutes()) * 60)) * 1000;
    
  }

  private async getIstTimeServer():Promise<number> {

    let currentTime: number;// = this.getMillisFromDate(new Date());;

    await this.http.getServerDate("serverDate")
    .then(dateObjs => {
      currentTime = dateObjs.timestapmIST;
    })
    .catch(error => {
      
      //error
    })

    return currentTime;
  }

  //
  public changeQueueStatus(queues:QueueModel[]){

    queues.forEach(async queue => {
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

  async originalBookingCheck(startMs:number, endMs:number): Promise<boolean>{
    
    let currentTime: number = this.getMillisFromDate(new Date());
    
    await this.http.getServerDate("serverDate")
      .then(dateObjs => {
        console.log("currentTime 1 >> server " + dateObjs.timestapmIST);

        let utcMillies: number = this.getUtCMillies(dateObjs.timestapmIST);

        currentTime = this.getMillisFromDate(new Date(utcMillies));;
        console.log("currentTime 1 " + currentTime);
      })
      .catch(error => {
      
        //error
      });
    console.log("currentTime 2    startMs => " + startMs);
    console.log("currentTime 2    endMs => " + endMs);
    
    if(+currentTime <= endMs && +currentTime >= startMs){
      return true;
    }else{
      return false;
    }

  }
  public getUtCMillies(istMillies: number): number{
    return (istMillies - (5.5 * 60 * 60 * 1000));
  }
}
