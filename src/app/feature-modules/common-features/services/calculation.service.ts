
import { Injectable } from '@angular/core';
import { BookedPatient } from '../../common-features/models/booked-patient';
import { QueueModel } from '../../common-features/models/queue-model';
@Injectable()

export class CalculationService {

    constructor(
    ) {
    }

    /* Converts provided milliseconds (UTC) to a time string e.g 10:20 AM */
    public millisToTimeString(milliseconds: number): string {

        return new Date(milliseconds).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    }// End of millisToTimeString

    /* Returns number of milliseconds before meeting starts  */
    public getRemainingTimeBeforeMeeting(queue: QueueModel, booking: BookedPatient): number {

        const difference: number = this.timeDiffrenceFromNow(queue.getConsultingStarting());
        const finaltime: number = (difference + (booking.getQueuePlace() - 1) * (queue.getTimePerPatient() * 60)) * 1000;
        return finaltime;
    }// End of getRemainingTimeBeforeMeeting

    /* Provides time difference between provied milliseconds(timestamp) and now returns 0 if that time is passed*/
    public timeDiffrenceFromNow(milliseconds: number): number {

        const nowSeconds = this.getSecondsOfTime((new Date()).getTime());
        const targetSeconds = this.getSecondsOfTime(milliseconds);

        if (targetSeconds <= nowSeconds) {
            return 0;
        }
        return (targetSeconds - nowSeconds);
    }// End of timeDiffrenceFromNow

    /* Provides time difference between provied milliseconds(timestamp) and now*/
    public getTimePassed(milliseconds: number): number {

        const nowSeconds = this.getSecondsOfTime((new Date()).getTime());
        const targetSeconds = this.getSecondsOfTime(milliseconds);

        if (nowSeconds <= targetSeconds) {
            return 0;
        }

        return (nowSeconds - targetSeconds);
    }// End of timeDiffrenceFromNow

    /* Converts provided milliseconds to time string in format of hh:mm:ss */
    public getRemainingTimeString(ms: number): string {
        if (isNaN(ms)) {
            return "00:00:00";
        }

        if (ms <= 0) {
            return '00:00:00';
        }
        return new Date(ms).toISOString().substr(11, 8);
    }// End of getRemainingTimeString

    /*Returns number of seconds of a perticular time of the day e.g 1:05 am is (1*60*60 + 05*60) = 3,900 seconds */
    private getSecondsOfTime(milliseconds: number): number {

        const date: Date = new Date(milliseconds);

        return (((+date.getHours()) * 60 * 60) + ((+date.getMinutes()) * 60)) + ((date.getSeconds()));
    } // End of getSecondsOfTime

    /*
     * Checks whether or not current time lies between two provided milliseconds
     */
    public isWithinRange(msStart: number, msEnd: number): boolean {

        const currentSeconds: number = this.getSecondsOfTime((new Date()).getTime());
        const startSeconds: number = this.getSecondsOfTime(msStart);
        const endSeconds: number = this.getSecondsOfTime(msEnd);

        if (currentSeconds < endSeconds && currentSeconds >= startSeconds) {
            return true;
        } else {
            return false;
        }

    }// End of isWithinRange

    public isQueueStartedNotEnded(msStart: number, msEnd: number): boolean {

        return this.isWithinRange(msStart, msEnd);

    }

    public isQueueEnded(msStart: number, msEnd: number): boolean {

        const currentSeconds: number = this.getSecondsOfTime((new Date()).getTime());
        const startSeconds: number = this.getSecondsOfTime(msStart);
        const endSeconds: number = this.getSecondsOfTime(msEnd);

        if (currentSeconds >= endSeconds && currentSeconds >= startSeconds) {
            return true;
        } else {
            return false;
        }
    }

    /*
     * Checks whether or not current server time lies between two provided milliseconds
     */
    public isWithinRangeServer(msStart: number, msEnd: number, serverTime: number): boolean {

        const currentSeconds: number = this.getSecondsOfTime((new Date(serverTime)).getTime());
        const startSeconds: number = this.getSecondsOfTime(msStart);
        const endSeconds: number = this.getSecondsOfTime(msEnd);

        if (currentSeconds < endSeconds && currentSeconds >= startSeconds) {
            return true;
        } else {
            return false;
        }

    }// End of isWithinRangeServer

    /*
     * Checks if time has been passed with respect to local time
     */
    public isTimePassed(targetMillis: number): boolean {

        const currentSeconds: number = this.getSecondsOfTime((new Date()).getTime());
        const targetSeconds: number = this.getSecondsOfTime(targetMillis);

        return targetSeconds < currentSeconds;

    }// End of isWithinRange
    /*
    This functions takes minutes and converts it to milliseconds
    */
    public getMinutesToMillis(minutes: number): number {
        return (minutes * 60 * 1000);
    }// End of getMinutesToMillis


}
