import { HttpService } from './http.service';
import { Injectable } from '@angular/core';
import { start } from 'repl';
import { QueueModel } from '../models/queue-model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoadingDialogComponent } from '../loading-dialog/loading-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {


  private loadingIndicator: MatDialogRef<any>;

  // { "timestapmIST": 1609694762338, "timestapmUTC": 1609674962338, "date": "3 0 2021" }

  constructor(private http: HttpService, private _snackBar: MatSnackBar, private matDialog: MatDialog) { }

  public millisToTimeString(milliseconds: number): string {

    milliseconds -= 5.5 * 3600000; //for IST

    return new Date(milliseconds).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  }
  public millisToDateString(milliseconds: number): string {
    return new Date(milliseconds).toLocaleDateString();
  }
  public completeTimeString(milliseconds: number): string {
    return new Date(milliseconds).toLocaleString();
  }
  public get24Time(milliseconds: number) {
    let date: Date = new Date(milliseconds);
    const hr = date.getUTCHours();
    const mi = date.getUTCMinutes();
    return hr + ':' + mi;
  }
  public getISTMilliseconds(milliseconds: number): number {
    milliseconds -= 5.5 * 3600000;
    return milliseconds;
  }
  public makeIstMillToUTCMilli(milliseconds: number) {
    milliseconds += 5.5 * 3600000;
    return milliseconds;
  }
  public getDay(milliseconds: number): string {

    milliseconds -= 5.5 * 3600000; //for IST

    let week: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return week[new Date(milliseconds).getDay()];
  }

  public initCap(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  public capitalize(str: string): string {
    return str.toUpperCase();
  }
  public getWorkingDays(holidays: string[]): string[] {

    let week: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    holidays.forEach(element => {
      const index = week.indexOf(element, 0);
      if (index > -1) {
        week.splice(index, 1);
      }
    });

    return week;
  }
  public isWithinTimeFrame(startMs: number | 0, endMs: number | 0, type?: string): boolean {

    let currentTime: number = this.getMillisFromDate(new Date());

    if (currentTime < endMs && currentTime >= startMs) {
      return true;
    } else {
      return false;
    }

  }

  public getTriggerTime(milliseconds: number, type?: string): number {

    if (milliseconds === 0 || milliseconds === undefined) {
      return 10;
    }

    let difference;
    milliseconds = this.getISTMilliseconds(milliseconds);

    let targetDate: Date = new Date(milliseconds);
    let currentDate: Date = new Date();

    difference = this.getDifferenceBetweenHrMi(currentDate, targetDate);

    return difference;
  }

  getDifferenceBetweenHrMi(currentDate: Date, targetDate: Date): number {

    let currentHr: number = currentDate.getHours();
    let currentMi: number = currentDate.getMinutes();

    let targetHr: number = targetDate.getHours();
    let targetMi: number = targetDate.getMinutes();

    let hrDifference: number, miDifference: number, totalMilliseconds: number;

    hrDifference = (24 - currentHr) - (24 - targetHr);
    miDifference = (60 - currentMi) - (60 - targetMi);

    if (hrDifference < 0) {
      hrDifference = 24 - Math.abs(hrDifference);
    }
    if (miDifference < 0) {
      hrDifference = Math.abs(hrDifference) - 1;
      miDifference = 60 - Math.abs(miDifference);
    }

    totalMilliseconds = ((hrDifference * 60 * 60) + (miDifference * 60)) * 1000;

    return totalMilliseconds;

  }

  isTimeWithinRange(startMs: number, endMs: number) {

  }

  getTimeDifference(from: number): number {

    let nowMills: number = this.getMillisFromDate(new Date());

    let difference: number;

    difference = nowMills - from;


    if (difference < 0) {
      return Math.abs(difference);
    } else {
      return Math.abs(86400000 - difference);
    }

  }

  getDateDigits(millis: number): string {

    const seconds: number = millis / 1000;
    const minutes: number = seconds / 60;

    return Math.floor(minutes / 60) + 'h : ' + Math.floor(minutes % 60) + 'm';
    // return  Math.floor(minutes%60)+'h : '+ Math.floor(minutes%60)+'m';

  }

  private getMillisFromDate(date: Date): number {

    return (((+date.getHours()) * 60 * 60) + ((+date.getMinutes()) * 60)) * 1000;

  }

  private async getIstTimeServer(): Promise<number> {

    let currentTime: number;// = this.getMillisFromDate(new Date());;

    await this.http.getServerDate()
      .then(dateObjs => {
        currentTime = dateObjs.timestapmIST;
      })
      .catch(error => {

        //error
      })

    return currentTime;
  }

  //
  public changeQueueStatus(queues: QueueModel[]) {

    queues.forEach(async queue => {
      if (this.isWithinTimeFrame(queue.getBookingStarting(), queue.getBookingEnding(), 'ist')) {
        queue.setStatus('booking');
      }
      if (this.isWithinTimeFrame(queue.getConsultingStarting(), queue.getConsultingEnding(), 'ist')) {
        queue.setStatus('live');
      }

      if (this.getTriggerTime(queue.getBookingStarting(), 'ist') !== -1) {
        setTimeout(() => {
          this.updateQueue(queue);
        }, this.getTriggerTime(queue.getBookingStarting(), 'ist'));
      }

      if (this.getTriggerTime(queue.getBookingEnding(), 'ist') !== -1) {
        setTimeout(() => {
          this.updateQueue(queue);
        }, this.getTriggerTime(queue.getBookingEnding(), 'ist'));
      }
      if (this.getTriggerTime(queue.getConsultingStarting(), 'ist') !== -1) {
        setTimeout(() => {
          this.updateQueue(queue);
        }, this.getTriggerTime(queue.getConsultingStarting(), 'ist'));
      }
      if (this.getTriggerTime(queue.getConsultingEnding(), 'ist') !== -1) {
        setTimeout(() => {
          this.updateQueue(queue, true);
        }, this.getTriggerTime(queue.getConsultingEnding(), 'ist'));
      }
    });
  }

  private updateQueue(queue: QueueModel, end?: boolean) {

    if (end) {
      queue.setStatus('scheduled');
      return;
    }
    if (this.isWithinTimeFrame(queue.getBookingStarting(), queue.getBookingEnding(), 'ist')) {
      queue.setStatus('booking');
    }
    if (this.isWithinTimeFrame(queue.getConsultingStarting(), queue.getConsultingEnding(), 'ist')) {
      queue.setStatus('live');
    }

  }

  async originalBookingCheck(startMs: number, endMs: number): Promise<boolean> {

    let currentTime: number = this.getMillisFromDate(new Date());

    await this.http.getServerDate()
      .then(dateObjs => {

        let utcMillies: number = this.getUtCMillies(dateObjs.timestapmIST);

        currentTime = this.getMillisFromDate(new Date(utcMillies));;
      })
      .catch(error => {

        //error
      });

    if (+currentTime <= endMs && +currentTime >= startMs) {
      return true;
    } else {
      return false;
    }

  }
  public getUtCMillies(istMillies: number): number {
    return (istMillies - (5.5 * 60 * 60 * 1000));
  }

  public shouldShowTimingDisplay(millies: number): boolean {

    let difference = this.getTriggerTime(millies);

    if (difference <= 7200000) {
      return true;
    } else {
      return false;
    }
  }

  public showMsgSnakebar(message: string) {
    this._snackBar.open(message, null, {
      duration: 2000,
    });
  }

  public showLoading(message: string): void {
    this.loadingIndicator = this.matDialog.open(LoadingDialogComponent, { disableClose: true, data: { message: message } });
  }
  public hideLoading(): void {
    if (this.loadingIndicator) {
      this.loadingIndicator.close();
    }

  }

}
