import { CalculationService } from './calculation.service';
import { BookedPatient } from "../models/booked-patient";
import { BookingPostpond } from "../models/booking-postpond";
import { BookingRefund } from "../models/booking-refund";
import { DoctorUserData } from "../models/doctor-user-data";
import { QueueModel } from "../models/queue-model";
import { Injectable } from '@angular/core';
import { PatientUserData } from '../models/patient-user-data';

@Injectable()

export class ObjectHelperService {

    constructor(private calculation: CalculationService) {

    }

    public findNextPatient(queue: QueueModel): BookedPatient {

        const pId: string = queue.getCurrentPatient()?.getBookingId() || '';


        for (let i = 0; i < queue.getBookings().length; ++i) {
            const patient = queue.getBookings()[i];
            if (!patient.isPending() && !patient.isProcessed() && pId !== patient.getBookingId()) {
                return patient;
            }

        }

        return this.findNextPendingPatient(queue);
    }

    public findNextPendingPatient(queue: QueueModel): BookedPatient {

        for (let i = 0; i < queue.getBookings().length; ++i) {
            const patient = queue.getBookings()[i];
            if (patient.isPending() && !patient.isProcessed()) {
                return patient;
            }

        }
        return null;
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



    public updatePatientModel(patient: BookedPatient, patientUpdate: BookedPatient): void {

        patient.setName(patientUpdate.getName());
        patient.setCurrentPatient(patientUpdate.isCurrentPatient());
        patient.setPending(patientUpdate.isPending());
        patient.setProcessed(patientUpdate.isProcessed());
        patient.setPicUrl(patientUpdate.getPicUrl());
        patient.setSelectionTime(patientUpdate.getSelectionTime());
        patient.setStatus(patientUpdate.getStatus());

        patient.setFrom(patientUpdate.getFrom());
        patient.setPatientId(patientUpdate.getPatientId());
        patient.setPhone(patientUpdate.getPhone());
        patient.setQueuePlace(patientUpdate.getQueuePlace());

        patient.setBookingTime(patientUpdate.getBookingTime());
        patient.setBookingId(patientUpdate.getBookingId());
        patient.setQueueId(patientUpdate.getQueueId());
        patient.setDoctorId(patientUpdate.getDoctorId());

        patient.setDoctorName(patientUpdate.getDoctorName());
        patient.setDoctorPic(patientUpdate.getPicUrl());

        patient.setPaidFees(patientUpdate.getPaidFees());
        patient.setOrderId(patientUpdate.getOrderId());
        patient.setAge(patientUpdate.getAge());
        patient.setSignature(patientUpdate.getSignature());
        patient.setDateString(patientUpdate.getDateString());

        patient.setBookingTimeServer(patientUpdate.getBookingTimeServer());
        patient.setCurrentPatient(patientUpdate.isCurrentPatient());

        patient.setProcessed(patientUpdate.isProcessed());
        patient.setProcessedTimeServer(patientUpdate.getProcessedTimeServer());

        patient.setAddress(patientUpdate.getAddress());
        patient.setGender(patientUpdate.getGender());
        patient.setCancelled(patientUpdate.isCancelled());
        patient.setCancelledBy(patientUpdate.getCancelledBy());

        patient.setCancellationReason(patientUpdate.getCancellationReason());
        patient.setCancelledAt(patientUpdate.getCancelledAt());

        patient.setQueueRef(patientUpdate.getQueueRef());
        patient.setDoctorRef(patientUpdate.getDoctorRef());

        patient.setQueueRef(patientUpdate.getQueueRef());
        patient.setDoctorRef(patientUpdate.getDoctorRef());
        patient.setMeetingTrials(patientUpdate.getMeetingTrials());

        this.assignPostpond(patient, patientUpdate);
        this.assignRefund(patient, patientUpdate);


    }
    private assignPostpond(patient: BookedPatient, patientUpdate: BookedPatient): void {


        if (!patientUpdate.getPostpond()) {
            return;
        }
        let postpond: BookingPostpond = new BookingPostpond();

        Object.assign(postpond, patientUpdate.getPostpond());

        if (!patient.getPostpond()) {
            patient.setPostpond(postpond);
        } else {
            patient.getPostpond().setApproved(postpond.isApproved());
            patient.getPostpond().setHandled(postpond.isHandled());
            patient.getPostpond().setProcessedAt(postpond.getProcessedAt());
            patient.getPostpond().setRejectReason(postpond.getRejectReason());
            patient.getPostpond().setRejected(postpond.isRejected());
            patient.getPostpond().setRequestReason(postpond.getRequestReason());
            patient.getPostpond().setRequested(postpond.isRequested());
            patient.getPostpond().setRequestedAt(postpond.getRequestedAt());
            patient.getPostpond().setRescheduleDate(postpond.getRescheduleDate());
        }

    }
    private assignRefund(patient: BookedPatient, patientUpdate: BookedPatient): void {

        if (!patientUpdate.getRefund()) {
            return;
        }
        let refund: BookingRefund = new BookingRefund();

        Object.assign(refund, patientUpdate.getRefund());

        if (!patient.getRefund()) {
            patient.setRefund(refund);
        } else {

            patient.getRefund().setApproved(refund.isApproved());
            patient.getRefund().setHandled(refund.isHandled());
            patient.getRefund().setProcessedAt(refund.getProcessedAt());
            patient.getRefund().setRejectReason(refund.getRejectReason());
            patient.getRefund().setRejected(refund.isRejected());
            patient.getRefund().setRequestReason(refund.getRequestReason());
            patient.getRefund().setRequested(refund.isRequested());
            patient.getRefund().setRequestedAt(refund.getRequestedAt());
        }

    }



    public updateQueueModel(queueOriginal: QueueModel, queue: QueueModel): void {


        queueOriginal.setCurrency(queue.getCurrency());
        queueOriginal.setFees(queue.getFees());
        queueOriginal.setStatus(queue.getStatus());
        queueOriginal.setActive(queue.isActive());
        queueOriginal.setPatientLimit(queue.getPatientLimit());
        queueOriginal.setTimePerPatient(queue.getTimePerPatient());
        queueOriginal.setBookingStarting(queue.getBookingStarting());
        queueOriginal.setBookingEnding(queue.getBookingEnding());
        queueOriginal.setConsultingStarting(queue.getConsultingStarting());
        queueOriginal.setConsultingEnding(queue.getConsultingEnding());
        queueOriginal.setBookedPatients(queue.getBookedPatients());
        queueOriginal.setQueueId(queue.getQueueId());
        queueOriginal.setOwnerId(queue.getOwnerId());
        queueOriginal.setHolidayList(queue.getHolidayList());
        queueOriginal.setType(queue.getType());
        queueOriginal.setPaymentOption(queue.getPaymentOption());
        queueOriginal.setStatus(queue.getStatus());
        queueOriginal.setTodayDateString(queue.getTodayDateString());
        queueOriginal.setCurrentBookingsCount(queue.getCurrentBookingsCount());
        queueOriginal.setNextNumber(queue.getNextNumber());
        queueOriginal.setCurrentNumber(queue.getCurrentNumber());

        queueOriginal.setBookingStartRemaingTime(this.calculation.timeDiffrenceFromNow(queueOriginal.getBookingStarting()) * 1000);
        queueOriginal.setBookingEndingRemaingTime(this.calculation.timeDiffrenceFromNow(queueOriginal.getBookingEnding()) * 1000);
        queueOriginal.setConsultingStartingRemaingTime(this.calculation.timeDiffrenceFromNow(queueOriginal.getConsultingStarting()) * 1000);
    }

    public updateQueueOfUser(queues: QueueModel[], queueUpdate: QueueModel): void {

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < queues.length; ++i) {

            const queue = queues[i];

            if (queue.getQueueId() === queueUpdate.getQueueId()) {
                this.updateQueueModel(queue, queueUpdate);
                return;
            }

        }

    }

    public deleteQueue(queues: QueueModel[], queueUpdate: QueueModel): void {


        for (let i = 0; i < queues.length; ++i) {

            const queue = queues[i];

            if (queue.getQueueId() === queueUpdate.getQueueId()) {

                queues.splice(i, 1);

                return;
            }

        }
    }

    public deletePatient(bookings: BookedPatient[], patient: BookedPatient): void {



        for (let i = 0; i < bookings.length; ++i) {

            const booking = bookings[i];

            if ((booking.getBookingId() === patient.getBookingId())
                && (booking.getQueueId() === patient.getQueueId())) {

                bookings.splice(i, 1);

                return;
            }

        }
    }

    public getNewBookingObject(userData: PatientUserData,
        currentQueue: QueueModel,
        currentDoctor: DoctorUserData,
        response: any,
        serverDate: any): BookedPatient {

        const bookedPaitient: BookedPatient = new BookedPatient();

        const name: string = userData.getFirstName() + ' ' + userData.getLastName();

        const currentTime: number = Date.now();

        bookedPaitient.setName(name);
        bookedPaitient.setPicUrl(userData.getPicUrl() || '');
        bookedPaitient.setAge(userData.getAge() || 18);
        bookedPaitient.setFrom(userData.getCity() || '');
        bookedPaitient.setPhone(userData.getPhoneNumber() || '');
        bookedPaitient.setStatus('online');
        bookedPaitient.setQueuePlace(currentQueue.getBookings().length + 1);
        bookedPaitient.setBookingTime(currentTime);
        bookedPaitient.setBookingId(currentTime.toString());
        bookedPaitient.setQueueId(currentQueue.getQueueId());
        bookedPaitient.setDoctorId(currentDoctor.getUserId());
        bookedPaitient.setDoctorName(currentDoctor.getFirstName() + ' ' + currentDoctor.getLastName());
        bookedPaitient.setPaymentId(response.razorpay_payment_id || '');
        bookedPaitient.setOrderId(response.razorpay_order_id || '');
        bookedPaitient.setSignature(response.razorpay_signature || '');
        bookedPaitient.setPatientId(userData.getUserId());
        bookedPaitient.setCurrentPatient(false);
        bookedPaitient.setPending(false);
        bookedPaitient.setProcessed(false);
        bookedPaitient.setCancelled(false);
        bookedPaitient.setCancelledBy('');
        bookedPaitient.setPostpond(null);
        bookedPaitient.setDoctorRef(currentDoctor.getRef());
        bookedPaitient.setQueueRef(currentQueue.getDocRef());

        const date: Date = new Date(+serverDate.timestapmUTC);

        const dateStr = date.getDate() + '' + date.getMonth() + '' + date.getFullYear();

        bookedPaitient.setDateString(dateStr);

        bookedPaitient.setBookingTimeServer(+serverDate.timestapmUTC);

        return bookedPaitient;
    }

    public updatePatient(patientUpdate: BookedPatient, queue: QueueModel): void {


        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < queue.getBookings().length; ++i) {

            const patient = queue.getBookings()[i];

            if (patientUpdate.getBookingId() === patient.getBookingId()) {

                this.updatePatientModel(patient, patientUpdate);

                if (patient.isCurrentPatient()) {
                    queue.setCurrentPatient(patient);
                }

                return;
            }

        }

    }

    public setCurrentPatient(queue: QueueModel): void {

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < queue.getBookings().length; ++i) {
            const patient = queue.getBookings()[i];
            if (patient.isCurrentPatient()) {
                queue.setCurrentPatient(patient);
                return;
            }

        }
        queue.setCurrentPatient(null);
    }
}