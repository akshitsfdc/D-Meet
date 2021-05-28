import { BookedPatient } from './../../../models/booked-patient';

import { Injectable } from '@angular/core';
import { QueueModel } from 'src/app/models/queue-model';

@Injectable()

export class CalculationService {

    constructor(
    ) {
    }

    public millisToTimeString(milliseconds: number): string {

        return new Date(milliseconds).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    }

    public getRemainingTimeBeforeMeeting(queue: QueueModel, booking: BookedPatient): number {

        const difference: number = this.timeDiffrenceFromNow(queue.getConsultingStarting());
        let finaltime: number = (difference + (booking.getQueuePlace() - 1) * (queue.getTimePerPatient() * 60)) * 1000;
        return finaltime;
    }

    public timeDiffrenceFromNow(milliseconds: number) {

        const nowSeconds = this.getSecondsOfTime((new Date()).getTime());
        const targetSeconds = this.getSecondsOfTime(milliseconds);

        if (targetSeconds <= nowSeconds) {
            return 0;
        }

        return (targetSeconds - nowSeconds);

    }
    public getRemainingTimeString(ms: number): string {

        return new Date(ms).toISOString().substr(11, 8);
    }
    private getSecondsOfTime(milliseconds: number): number {

        const date: Date = new Date(milliseconds);

        return (((+date.getHours()) * 60 * 60) + ((+date.getMinutes()) * 60));
    }

}