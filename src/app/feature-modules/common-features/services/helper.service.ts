import { UtilsService } from 'src/app/services/utils.service';
import { CalculationService } from './calculation.service';
import { QueueModel } from './../models/queue-model';
import { BookedPatient } from './../models/booked-patient';

import { Injectable } from '@angular/core';
import { DoctorUserData } from '../models/doctor-user-data';

@Injectable()

export class HelperService {



    constructor(private calculation: CalculationService, private utils: UtilsService) { }

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

        if (this.calculation.isTimePassed(queue.getConsultingStarting()) && queue.getBookings().length > 0 && !queue.getCurrentPatient()) {
            return true;
        }

        return false;
    }

    public shouldShowNextEndButton(queue: QueueModel): boolean {


        if (this.calculation.isTimePassed(queue.getConsultingStarting())
            && queue.getBookings().length > 0 && queue.getCurrentPatient() && !queue.isQueueEnded()) {

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

    public updateDoctor(userData: DoctorUserData, userDataUpdate: DoctorUserData): void {

        userData.setEmail(userDataUpdate.getEmail());
        userData.setFirstName(userDataUpdate.getFirstName());
        userData.setLastName(userDataUpdate.getLastName());
        userData.setGender(userDataUpdate.getGender());
        userData.setPicUrl(userDataUpdate.getPicUrl());
        userData.setUserId(userDataUpdate.getUserId());
        userData.setProfileId(userDataUpdate.getProfileId());

        userData.setRegistrationNumber(userDataUpdate.getRegistrationNumber());
        userData.setExperience(userDataUpdate.getExperience());
        userData.setDegree(userDataUpdate.getDegree());
        userData.setSpeciality(userDataUpdate.getSpeciality());
        userData.setClinicName(userDataUpdate.getClinicName());
        userData.setFullClinicAddress(userDataUpdate.getFullClinicAddress());
        userData.setCountry(userDataUpdate.getCountry());
        userData.setState(userDataUpdate.getState());
        userData.setCity(userDataUpdate.getCity());
        userData.setVarified(userDataUpdate.isVarified());
        userData.setAbout(userDataUpdate.getAbout());
        userData.setRegistrationLocalTimeStapm(userDataUpdate.getRegistrationLocalTimeStapm());
        userData.setKycSubmitted(userDataUpdate.isKycSubmitted());
        userData.setNearbyAddress(userDataUpdate.getNearbyAddress());
        userData.setDiseaseSpecialist(userDataUpdate.getDiseaseSpecialist());
        userData.setCoordinates(userDataUpdate.getCoordinates());
        userData.setStatus(userDataUpdate.getStatus());

    }
}
