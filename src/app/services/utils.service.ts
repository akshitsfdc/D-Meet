import { Injectable } from '@angular/core';

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
  public getDay(milliseconds:number):string{

    milliseconds -= 5.5 * 3600000; //for IST

    let week:string[] = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return week[new Date(milliseconds).getDay()];
  }
}
