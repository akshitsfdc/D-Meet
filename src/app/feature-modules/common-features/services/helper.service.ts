import { ObjectHelperService } from './object-helper.service';
import { UtilsService } from 'src/app/services/utils.service';
import { CalculationService } from './calculation.service';
import { QueueModel } from './../models/queue-model';
import { BookedPatient } from './../models/booked-patient';

import { Injectable } from '@angular/core';
import { DoctorUserData } from '../models/doctor-user-data';

@Injectable()

export class HelperService {



    constructor(private calculation: CalculationService, private objectHelper: ObjectHelperService) { }

    public showThisPatient(patient: BookedPatient): boolean {

        if (patient === null || patient === undefined) {
            return false;
        }

        if (patient.isProcessed() || patient.isCancelled() || patient.isPending()) {
            return false;
        }

        if (patient.getPostpond() !== null && patient.getPostpond() !== undefined) {
            if (patient.getPostpond().isApproved()) {
                return false;
            }
        }


        return true;
    }
    public showThisPatientAsNext(patient: BookedPatient): boolean {

        if (patient === null || patient === undefined) {
            return false;
        }

        if (patient.isProcessed() || patient.isCancelled()) {
            return false;
        }

        if (patient.getPostpond() !== null && patient.getPostpond() !== undefined) {
            if (patient.getPostpond().isApproved()) {
                return false;
            }
        }


        return true;
    }

    public printDoctorName(doctor: DoctorUserData): string {
        return 'Dr. ' + doctor.getFirstName() + ' ' + doctor.getLastName();
    }

    public isBookingAvailable(queue: QueueModel): boolean {
        return this.calculation.isWithinRange(queue.getBookingStarting(), queue.getBookingEnding());
    }

    public isConsultingStarted(queue: QueueModel): boolean {
        return this.calculation.isWithinRange(queue.getConsultingStarting(), queue.getConsultingEnding());
    }

    public shouldShowStartButton(queue: QueueModel): boolean {



        const bookings: BookedPatient[] = queue.getBookings();
        const currentPatient: BookedPatient = queue.getCurrentPatient();
        const consultingStarted: boolean = this.calculation.isQueueStartedNotEnded(queue.getConsultingStarting(), queue.getConsultingEnding());
        const nextPatient: BookedPatient = queue.getNextPatient();
        const queueNoDue: boolean = nextPatient === null;


        if (queue && bookings && !currentPatient && consultingStarted && bookings.length > 0 && !queueNoDue) {
            return true;
        }

        return false;

    }

    public shouldShowNextEndButton(queue: QueueModel): boolean {

        const bookings: BookedPatient[] = queue.getBookings();
        const currentPatient: BookedPatient = queue.getCurrentPatient();
        const consultingStarted: boolean = this.calculation.isQueueStartedNotEnded(queue.getConsultingStarting(), queue.getConsultingEnding());
        if (queue && bookings && currentPatient && consultingStarted && bookings.length > 0) {
            return true;
        }
        return false;
    }

    public getStatusClass(queue: QueueModel): any {
        return {
            'header-status-icon': true,
            'icon-scheduled': (!this.isBookingAvailable(queue) && !this.isConsultingStarted(queue)),
            'icon-booking': (this.isBookingAvailable(queue) && !this.isConsultingStarted(queue)),
            'icon-live': this.isConsultingStarted(queue)
        };
    }

    public getStatusCardClass(queue: QueueModel): any {
        return {
            'status-card': true,
            'status-card-scheduled': (!this.isBookingAvailable(queue) && !this.isConsultingStarted(queue)),
            'status-card-booking': (this.isBookingAvailable(queue) && !this.isConsultingStarted(queue)),
            'status-card-live': this.isConsultingStarted(queue)
        };

    }

    public getStatusLabelClass(queue: QueueModel): any {
        return {
            'live-label': !(!this.isBookingAvailable(queue) && !this.isConsultingStarted(queue))
        };
    }

    public getStatusText(queue: QueueModel): string {

        if (this.isConsultingStarted(queue)) {
            return 'LIVE';
        } else if (this.isBookingAvailable(queue)) {
            return 'Booking';
        } else {
            return 'Scheduled';
        }
    }

    public setQueueLiveMessage(queue: QueueModel) {

        let liveMessage: string = "";

        const bookings: BookedPatient[] = queue.getBookings();
        const myBooking: BookedPatient = queue.getMyBooking();
        const currentPatient: BookedPatient = queue.getCurrentPatient();

        const bookingStarted: boolean = this.calculation.isQueueStartedNotEnded(queue.getBookingStarting(), queue.getBookingEnding());
        const consultingStarted: boolean = this.calculation.isQueueStartedNotEnded(queue.getConsultingStarting(), queue.getConsultingEnding());

        const bookingEnded: boolean = this.calculation.isQueueEnded(queue.getBookingStarting(), queue.getBookingEnding());
        const consultingEnded: boolean = this.calculation.isQueueEnded(queue.getConsultingStarting(), queue.getConsultingEnding());

        const nextPatient: BookedPatient = queue.getNextPatient();
        const queueNoDue: boolean = nextPatient === null;

        console.log(" consultingStarted : " + consultingStarted + " queueNoDue : " + queueNoDue + " !consultingEnded : " + consultingEnded);


        if (!bookingStarted && !bookingEnded) {// Booking not started
            liveMessage = "Boooking not started yet";
        } else if (bookingStarted && !consultingStarted && bookings.length > 0) {
            liveMessage = "Waiting for doctor to start consulting";
        } else if (bookingStarted && consultingStarted && !consultingEnded && bookings.length === 0) {
            liveMessage = "Queue is live, be the first one in this queue";
        } else if (bookingStarted && !consultingStarted && !bookingEnded && bookings.length === 0) {
            liveMessage = "Booking is open, be the first one, in this queue";
        } else if (bookingEnded && consultingEnded && queueNoDue && bookings.length > 0) {
            liveMessage = "Queue processing has been completed for today";
        } else if (!currentPatient && consultingStarted && !queueNoDue) {
            liveMessage = "Waiting for doctor to select " + nextPatient.getName() + " for meeting";
        } else if (myBooking && currentPatient && myBooking.getBookingId() === currentPatient.getBookingId()) {
            liveMessage = "You are currently in meeting room with doctor";
        } else if (!currentPatient && consultingStarted && queueNoDue && !consultingEnded && bookings.length > 0) {
            liveMessage = "Doctor has processed every patient in queue";
        } else if (currentPatient) {
            liveMessage = currentPatient.getName() + " is currently in meeting room with doctor";
        }

        queue.setLiveMessage(liveMessage);

    }

    public setQueueSatatusMessage(queue: QueueModel) {

        let statusMessage: string = "";

        const bookingStarted: boolean = this.calculation.isQueueStartedNotEnded(queue.getBookingStarting(), queue.getBookingEnding());
        const bookingEnded: boolean = this.calculation.isQueueEnded(queue.getBookingStarting(), queue.getBookingEnding());

        if (!bookingStarted && bookingEnded) {
            statusMessage = "Booking Closed";
        } else if (!bookingStarted && !bookingEnded) {
            statusMessage = "Booking Starting soon";
        } else if (bookingStarted) {
            statusMessage = "Booking Open";
        }

        queue.setQueueStatusMessage(statusMessage);

    }


    public getDateStringForQuery(millis: number): string {

        const date: Date = new Date(millis);

        const dateStr = date.getDate() + '' + date.getMonth() + '' + date.getFullYear();

        return dateStr;
    }
}
