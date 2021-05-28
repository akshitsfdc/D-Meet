import { CalculationService } from './../service/calculation.service';
import { queue } from 'rxjs/internal/scheduler/queue';
import { SearchedDoctor } from './../models/searched-doctor';
import { BookingRefund } from './../../../models/booking-refund';
import { RequestRefundComponent } from './../request-refund/request-refund.component';
import { CancelMeetingAlertComponent } from './../cancel-meeting-alert/cancel-meeting-alert.component';
import { BookingRescheduleSelectorComponent } from './../booking-reschedule-selector/booking-reschedule-selector.component';
import { BookingPostpond } from './../../../models/booking-postpond';
import { PNBookingReschedule } from './../../../models/p-n-booking-reschedule';
import { UtilsService } from './../../../services/utils.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { BookedPatient } from 'src/app/models/booked-patient';
import { SessionService } from '../service/session.service';
import { HttpService } from 'src/app/services/http.service';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { PatientFirestoreService } from '../service/patient-firestore.service';
import { AngularFirestoreDocument, DocumentData } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { BookingCancledNotification } from 'src/app/models/n-booking-canceled';
import { RefundRequestNotification } from 'src/app/models/n-refund-request';
import { MeetupRefundRequest } from '../models/meetup-refund-requst';
import { DoctorUserData } from 'src/app/models/doctor-user-data';
import { SearchService } from '../service/search.service';
import { Router } from '@angular/router';
import { QueueModel } from 'src/app/models/queue-model';



class BookingWrapper {

  bookings: BookedPatient[];
  initCompleted: boolean;
  noData: boolean;
  filterStart: number;
  filterEnd: number;
  lastVisible: DocumentData;
  obsSubscription: Subscription;
  filterActivated: boolean;
  loadingMore: boolean;
  listEnded: boolean;

}

class IntervalWrapper {

  bookingId: string;
  interval: NodeJS.Timeout;

}

@Component({
  selector: 'app-meetings',
  templateUrl: './meetings.component.html',
  styleUrls: ['./meetings.component.scss']
})

export class MeetingsComponent implements OnInit, OnDestroy {


  public serverDateString: string = "";

  private loadLimit: number = 1;
  private serverDate: number = 0;

  private subscriptions: Subscription[] = [];
  private intervalWrappers: IntervalWrapper[] = [];

  public myBokings: BookingWrapper = new BookingWrapper();
  public cancledBookings: BookingWrapper = new BookingWrapper();
  public liveBookings: BookingWrapper = new BookingWrapper();
  public notHandledBookings: BookingWrapper = new BookingWrapper();

  public cRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });
  public lRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });
  public cnRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });
  public unRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });
  constructor(public session: SessionService,
    private firestore: PatientFirestoreService,
    private http: HttpService, public utills: UtilsService,
    private matDialog: MatDialog,
    public searchService: SearchService,
    public utils: UtilsService,
    public calculation: CalculationService,
    private router: Router) {

    this.liveBookings.bookings = [];
    this.myBokings.bookings = [];
    this.cancledBookings.bookings = [];
    this.notHandledBookings.bookings = [];

  }

  ngOnDestroy(): void {
    if (this.liveBookings.obsSubscription !== null && this.liveBookings.obsSubscription !== undefined) {
      this.liveBookings.obsSubscription.unsubscribe();
    }
    this.subscriptions.forEach(sub => {
      if (sub !== null && sub !== undefined) {
        sub.unsubscribe();
      }
    });

    this.intervalWrappers.forEach(intervalWrapper => {
      if (intervalWrapper.interval) {
        clearInterval(intervalWrapper.interval);
      }
    });
  }

  ngOnInit(): void {

    this.loadLiveBookings();
    this.loadNonFilteredBookings(true, this.myBokings);
    this.loadCancelledBookings(true, this.cancledBookings);
    this.loadUnhandledBookings(true, this.notHandledBookings);

  }


  private loadLiveBookings() {

    const userId: string = this.session.getUserData().getUserId();

    this.http.getServerDate()

      .then(dateObj => {

        this.serverDate = dateObj.timestapmUTC;

        const millies: number = this.utills.getUtCMillies(dateObj.timestapmIST);
        const date: Date = new Date(millies);
        const dateStr: string = date.getDate() + '' + date.getMonth() + '' + date.getFullYear();

        this.serverDateString = dateStr;

        this.liveBookings.obsSubscription = this.firestore.getScheduledMeetings(userId, dateStr, 100)

          .subscribe(docChangeList => {


            this.liveBookings.initCompleted = true;
            if (docChangeList.length == 0) {
              this.liveBookings.noData = true;
            } else {
              this.liveBookings.noData = false;
            }
            console.log("Live booking subscribed ! " + docChangeList.length);

            docChangeList.forEach(async (change) => {

              switch (change.payload.type) {

                case "added":
                  let booking: BookedPatient = new BookedPatient();
                  let postPone: BookingPostpond = new BookingPostpond();
                  let refund: BookingRefund = new BookingRefund();

                  Object.assign(booking, change.payload.doc.data());

                  Object.assign(postPone, booking.getPostpond());
                  Object.assign(refund, booking.getRefund());

                  booking.setRefund(refund);
                  booking.setPostpond(postPone);

                  this.liveBookings.bookings.push(booking);

                  booking.setDocReference(change.payload.doc.ref);

                  this.subscribeToQueue(booking);

                  break;
                case "modified":
                  let bookingUpdate: BookedPatient = new BookedPatient();
                  Object.assign(bookingUpdate, change.payload.doc.data());
                  this.updateBookings(this.liveBookings, bookingUpdate);
                  bookingUpdate.setDocReference(change.payload.doc.ref);
                  break;
                case "removed":

                  break;

              }

            });
          });
      })
      .catch(error => {
        this.utills.hideLoading();
        console.log("Server date error " + error);

      });


  }

  private subscribeToQueue(booking: BookedPatient) {

    const thisRef = this;

    booking.getQueueRef().onSnapshot({
      next(snapshot) {
        let queue: QueueModel = new QueueModel();
        Object.assign(queue, snapshot.data());
        booking.setSelfWaitingTime(thisRef.calculation.getRemainingTimeBeforeMeeting(queue, booking));
        //console.log("Time : " + thisRef.calculation.getRemainingTimeBeforeMeeting(queue, booking));
        thisRef.startTimer(booking);
      },
      error(msg) {
        console.log("Obs error subscribeToQueue >> : " + msg);
      },
      complete: () => console.log('subscribeToQueue >> completed')
    })


  }

  private startTimer(booking: BookedPatient) {



    let interval: NodeJS.Timeout = setInterval(() => {

      let timeLeft = booking.getSelfWaitingTime() - 1000;

      if (timeLeft <= 0) {
        booking.setSelfWaitingTime(0);
        booking.setSelfWaitingTimeString("about to start...");
        clearInterval(interval);
      } else {
        booking.setSelfWaitingTime(timeLeft);
        booking.setSelfWaitingTimeString(this.calculation.getRemainingTimeString(timeLeft));
      }
    }, 1000);

    let intervalWrapper: IntervalWrapper = this.getInterValWrapper(booking.getBookingId());

    if (intervalWrapper !== null) {

      if (intervalWrapper.interval) {
        clearInterval(intervalWrapper.interval);
      }
      intervalWrapper.interval = interval;

    } else {

      let intervalWrapper: IntervalWrapper = new IntervalWrapper();

      intervalWrapper.interval = interval;
      intervalWrapper.bookingId = booking.getBookingId();

      this.intervalWrappers.push(intervalWrapper);
    }
    // this.intervalWrappers.push(intervalWrappers);
  }

  private getInterValWrapper(bookingId: string): IntervalWrapper {

    for (let i: number = 0; i < this.intervalWrappers.length; ++i) {
      if (this.intervalWrappers[i].bookingId === bookingId) {
        return this.intervalWrappers[i];
      }
    }
    return null;
  }

  private updateBookings(bookingWrapper: BookingWrapper, bookingUpdate: BookedPatient): void {

    for (let i = 0; i < bookingWrapper.bookings.length; ++i) {
      if (bookingUpdate.getBookingId() === bookingWrapper.bookings[i].getBookingId()) {
        this.bookingReasign(bookingWrapper.bookings[i], bookingUpdate);
        break;
      }
    }
  }

  private getBookingIndex(wrapper: BookingWrapper, booking: BookedPatient): number {

    for (let i = 0; i < wrapper.bookings.length; ++i) {
      if (wrapper.bookings[i].getBookingId() === booking.getBookingId()) {
        return i;
      }
    }

    return -1;
  }
  private removeFromList(wrapper: BookingWrapper, index: number) {
    if (index === -1) {
      return;
    }
    wrapper.bookings.splice(index, 1);
  }
  private bookingReasign(oldBooking: BookedPatient, newBooking: BookedPatient): void {

    oldBooking.setName(newBooking.getName());
    oldBooking.setOrderId(newBooking.getOrderId());
    oldBooking.setBookingId(newBooking.getBookingId());
    oldBooking.setBookingTime(newBooking.getBookingTime());
    oldBooking.setBookingTimeServer(newBooking.getBookingTimeServer());
    oldBooking.setDateString(newBooking.getDateString());
    oldBooking.setDoctorId(newBooking.getDoctorId());
    oldBooking.setPatientId(newBooking.getPatientId());
    oldBooking.setPaymentId(newBooking.getPaymentId());
    oldBooking.setPending(newBooking.isPending());
    oldBooking.setPhone(newBooking.getPhone());
    oldBooking.setPicUrl(newBooking.getPicUrl());
    oldBooking.setProcessed(newBooking.isProcessed());
    oldBooking.setQueueId(newBooking.getQueueId());
    oldBooking.setQueuePlace(newBooking.getQueuePlace());
    oldBooking.setStatus(newBooking.getStatus());
    oldBooking.setFrom(newBooking.getFrom());
    oldBooking.setAge(newBooking.getAge());
    oldBooking.setCurrentPatient(newBooking.isCurrentPatient());
    oldBooking.setAddress(newBooking.getAddress());
    oldBooking.setGender(newBooking.getGender());

    let postPoneUpdate: BookingPostpond = new BookingPostpond();
    let refund: BookingRefund = new BookingRefund();

    Object.assign(postPoneUpdate, newBooking.getPostpond());
    Object.assign(refund, newBooking.getRefund());

    oldBooking.setRefund(refund);
    oldBooking.setPostpond(postPoneUpdate);

  }

  rangeChanged(wrapper: BookingWrapper, group: FormGroup) {

    const start: string = group.get("start").value || "";
    const end: string = group.get("end").value || "";

    console.log("start : " + start);
    console.log("end : " + end);

    if (start.length === 0 || end.length === 0) {
      return;
    }

    let startDate: Date = new Date(start);
    let endDate: Date = new Date(end);

    console.log("Start date number : " + startDate.getTime());
    console.log("End date number : " + endDate.getTime());

    wrapper.filterStart = startDate.getTime();
    wrapper.filterEnd = endDate.getTime();

    wrapper.filterActivated = true;

    if (wrapper === this.myBokings) {
      this.loadFilteredBookings(true, wrapper);
    } else if (wrapper === this.notHandledBookings) {
      this.loadUnhandledFilteredBookings(true, this.notHandledBookings);
    } else {
      this.loadCancelledFilteredBookings(true, wrapper);
    }


  }
  public loadMoreAction(wrapper: BookingWrapper) {

    if (wrapper === this.myBokings) {

      if (wrapper.filterActivated) {
        this.loadFilteredBookings(false, wrapper);
      } else {
        this.loadNonFilteredBookings(false, wrapper);
      }

    } else if (wrapper === this.notHandledBookings) {
      if (wrapper.filterActivated) {
        this.loadUnhandledFilteredBookings(false, wrapper);
      } else {
        this.loadUnhandledBookings(false, wrapper);
      }
    } else {

      if (wrapper.filterActivated) {
        this.loadCancelledFilteredBookings(false, wrapper);
      } else {
        this.loadCancelledBookings(false, wrapper);
      }

    }


  }

  private loadFilteredBookings(firstRequest: boolean, wrapper: BookingWrapper): void {


    if (!firstRequest) {
      wrapper.loadingMore = true;
    } else {
      wrapper.initCompleted = false;
    }

    const userId: string = this.session.getUserData().getUserId();

    this.firestore.getMyFilteredBookings(userId, this.loadLimit, firstRequest, wrapper.filterStart, wrapper.filterEnd, wrapper.lastVisible)
      .then(snapshots => {

        if (!snapshots || !snapshots.docs) {
          return;
        }

        this.loadingActions(firstRequest, snapshots, wrapper);


      })
      .catch(error => {
        console.log("error > " + error);
        if (!firstRequest) {
          wrapper.loadingMore = false;
        } else {
          wrapper.initCompleted = true;
        }

      })
  }

  private loadNonFilteredBookings(firstRequest: boolean, wrapper: BookingWrapper): void {


    if (!firstRequest) {
      wrapper.loadingMore = true;
    } else {
      wrapper.initCompleted = false;
    }


    const userId: string = this.session.getUserData().getUserId();

    this.firestore.getMyBookings(userId, this.loadLimit, firstRequest, wrapper.lastVisible)
      .then(snapshots => {

        if (!snapshots || !snapshots.docs) {
          return;
        }
        this.loadingActions(firstRequest, snapshots, wrapper);

      })
      .catch(error => {
        console.log("error > " + error);
        if (!firstRequest) {
          wrapper.loadingMore = false;
        } else {
          wrapper.initCompleted = true;
        }

      })
  }


  //for cancelled

  private loadCancelledFilteredBookings(firstRequest: boolean, wrapper: BookingWrapper): void {

    if (!firstRequest) {
      wrapper.loadingMore = true;
    } else {
      wrapper.initCompleted = false;
    }

    const userId: string = this.session.getUserData().getUserId();

    this.firestore.getCancelledFilteredBookings(userId, this.loadLimit, firstRequest, wrapper.filterStart, wrapper.filterEnd, wrapper.lastVisible)
      .then(snapshots => {

        if (!snapshots || !snapshots.docs) {
          return;
        }

        this.loadingActions(firstRequest, snapshots, wrapper);

      })
      .catch(error => {
        console.log("error > " + error);
        if (!firstRequest) {
          wrapper.loadingMore = false;
        } else {
          wrapper.initCompleted = true;
        }

      })
  }

  private loadCancelledBookings(firstRequest: boolean, wrapper: BookingWrapper): void {



    if (!firstRequest) {
      wrapper.loadingMore = true;
    } else {
      wrapper.initCompleted = false;
    }

    const userId: string = this.session.getUserData().getUserId();

    this.firestore.getCancelledBookings(userId, this.loadLimit, firstRequest, wrapper.lastVisible)
      .then(snapshots => {

        if (!snapshots || !snapshots.docs) {
          return;
        }

        this.loadingActions(firstRequest, snapshots, wrapper);

        console.log(wrapper.bookings.length);

      })
      .catch(error => {

        console.log("error > " + error);

        if (!firstRequest) {
          wrapper.loadingMore = false;
        } else {
          wrapper.initCompleted = true;
        }

      })
  }


  //for unhandled meetings

  private loadUnhandledFilteredBookings(firstRequest: boolean, wrapper: BookingWrapper): void {

    if (!firstRequest) {
      wrapper.loadingMore = true;
    } else {
      wrapper.initCompleted = false;
    }

    const userId: string = this.session.getUserData().getUserId();

    this.firestore.getUnhandledFilteredBookings(userId, this.loadLimit, firstRequest, wrapper.filterStart, wrapper.filterEnd, wrapper.lastVisible)
      .then(snapshots => {

        if (!snapshots || !snapshots.docs) {
          return;
        }

        this.loadingActions(firstRequest, snapshots, wrapper);

      })
      .catch(error => {
        console.log("error > " + error);
        if (!firstRequest) {
          wrapper.loadingMore = false;
        } else {
          wrapper.initCompleted = true;
        }

      })
  }

  private loadUnhandledBookings(firstRequest: boolean, wrapper: BookingWrapper): void {



    if (!firstRequest) {
      wrapper.loadingMore = true;
    } else {
      wrapper.initCompleted = false;
    }

    const userId: string = this.session.getUserData().getUserId();

    this.firestore.getUnhandledBookings(userId, this.loadLimit, firstRequest, wrapper.lastVisible)
      .then(snapshots => {

        if (!snapshots || !snapshots.docs) {
          return;
        }

        this.loadingActions(firstRequest, snapshots, wrapper);


      })
      .catch(error => {

        console.log("error > " + error);

        if (!firstRequest) {
          wrapper.loadingMore = false;
        } else {
          wrapper.initCompleted = true;
        }

      })
  }

  private loadingActions(firstRequest: boolean, snapshots: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>, wrapper: BookingWrapper): void {

    if (firstRequest) {
      wrapper.bookings = [];
    }

    //for loading indicator
    if (!firstRequest) {
      wrapper.loadingMore = false;
    } else {
      wrapper.initCompleted = true;
    }
    //for loading indicator end

    //List loading ended
    if (snapshots.docs.length < this.loadLimit) {
      wrapper.listEnded = true;
    } else {
      wrapper.listEnded = false;
    }

    if (snapshots.docs.length > 0) {
      wrapper.lastVisible = snapshots.docs[snapshots.docs.length - 1];
      wrapper.noData = false;
    } else {
      wrapper.noData = true;
    }

    snapshots.docs.forEach(doc => {

      let booking: BookedPatient = new BookedPatient();
      let postPone: BookingPostpond = new BookingPostpond();
      let refund: BookingRefund = new BookingRefund();

      Object.assign(booking, doc.data());

      Object.assign(postPone, booking.getPostpond());
      Object.assign(refund, booking.getRefund());

      booking.setPostpond(postPone);
      booking.setRefund(refund);


      wrapper.bookings.push(booking);

      booking.setDocReference(doc.ref);




    })
  }

  public showReSchedulePopup(booking: BookedPatient): void {

    let dialogData = {
      currentDate: this.serverDate
    }


    this.matDialog.open(BookingRescheduleSelectorComponent, {
      data: dialogData, disableClose: false
    }).afterClosed().toPromise()
      .then(result => {
        if (result.approved) {
          this.sendPostpondRequest(booking, result.selectedDateMillies, result.reason);
        }
      });
  }

  public showCancelMeetingPopup(booking: BookedPatient): void {

    let dialogData = {
      currentDate: this.serverDate
    }


    this.matDialog.open(CancelMeetingAlertComponent, {
      data: dialogData, disableClose: false,
      maxWidth: 550
    }).afterClosed().toPromise()
      .then(result => {
        if (result.approved) {
          this.cancelMeeting(booking);
        }
      });
  }

  public showRequestRefundPopup(booking: BookedPatient): void {

    let dialogData = {
      currentDate: this.serverDate
    }


    this.matDialog.open(RequestRefundComponent, {
      data: dialogData, disableClose: false,
      maxWidth: 550
    }).afterClosed().toPromise()
      .then(result => {
        if (result.approved) {
          // this.cancelMeeting(booking);
          this.requestRefund(booking);
        }
      });

  }

  private requestRefund(booking: BookedPatient): void {

    this.utills.showLoading("Sending request...");

    let date: Date = new Date();
    const currentTime: number = date.getTime();

    let refundNoitification: RefundRequestNotification = new RefundRequestNotification();

    refundNoitification.setPatientName(booking.getName());
    refundNoitification.setRefundAmount(booking.getPaidFees() || 0);
    refundNoitification.setQueuePlace(booking.getQueuePlace());
    refundNoitification.setQueueId(booking.getQueueId());
    refundNoitification.setRead(false);
    refundNoitification.setRequestHandled(false);
    refundNoitification.setNotificationId("" + currentTime);
    refundNoitification.setNotificationType("refund_request");

    let meetupRefundReq: MeetupRefundRequest = new MeetupRefundRequest();

    meetupRefundReq.setAmount(booking.getPaidFees() || 0);
    meetupRefundReq.setBookingRef(booking.getDocReference());
    meetupRefundReq.setPatientName(booking.getName());
    meetupRefundReq.setReason("Doctor not contacted");
    meetupRefundReq.setStatus("Requested");
    meetupRefundReq.setRequestTime(currentTime);

    let finalBookingJson: any = { "refund": {} };


    let bookingrefund: BookingRefund = new BookingRefund();
    bookingrefund.setRequested(true);
    bookingrefund.setApproved(false);
    bookingrefund.setRejected(false);
    bookingrefund.setProcessedAt(0);
    bookingrefund.setHandled(false);
    bookingrefund.setRequestedAt(currentTime);

    let refundBackup: BookingRefund = booking.getRefund();

    booking.setRefund(bookingrefund);

    finalBookingJson.refund = Object.assign({}, bookingrefund);

    this.firestore.sendRefundRequest(booking.getDoctorId(), Object.assign({}, refundNoitification)
      , booking.getDocReference(), finalBookingJson, Object.assign({}, meetupRefundReq)
    )
      .then(() => {
        this.utills.showMsgSnakebar("Your refund request has been sent!");
        this.utills.hideLoading();
      })
      .catch(error => {
        console.log("Error sending postpond Notification.");
        booking.setRefund(refundBackup);
        this.utills.hideLoading();
      });
  }
  private cancelMeeting(booking: BookedPatient) {

    this.utills.showLoading("Cancelling meeting...");

    let date: Date = new Date();
    const currentTime: number = date.getTime();

    let bookingCanceledObject: BookingCancledNotification = new BookingCancledNotification();

    bookingCanceledObject.setPatientName(booking.getName());
    bookingCanceledObject.setQueuePlace(booking.getQueuePlace());
    bookingCanceledObject.setQueueId(booking.getQueueId());
    bookingCanceledObject.setRead(false);
    bookingCanceledObject.setRequestHandled(false);
    bookingCanceledObject.setNotificationId("" + currentTime);
    bookingCanceledObject.setNotificationType("meeting_canceled");


    booking.setCancelled(true);
    booking.setCancelledBy('p');
    booking.setCancelledAt(currentTime);

    let finalBookingJson: any = Object.assign({}, booking);

    finalBookingJson.postpond = Object.assign({}, booking.getPostpond());

    this.firestore.sendCancelMeetingBatch(booking.getDoctorId(), Object.assign({}, bookingCanceledObject)
      , booking.getDocReference(), finalBookingJson
    )
      .then(() => {
        this.utills.showMsgSnakebar("Meeting Cancelled!");
        this.utills.hideLoading();

      })
      .catch(error => {
        console.log("Error sending cancel meeting Notification.");
        this.utills.hideLoading();
        booking.setCancelled(false);
        booking.setCancelledBy('');
        booking.setCancelledAt(0);
      });


  }

  private sendPostpondRequest(booking: BookedPatient, rescheduleDateMilli: number, reason: string): void {

    this.utills.showLoading("Sending request...");

    let date: Date = new Date();
    const currentTime: number = date.getTime();

    let postpondObject: PNBookingReschedule = new PNBookingReschedule();

    postpondObject.setPatientName(booking.getName());
    postpondObject.setQueuePlace(booking.getQueuePlace());
    postpondObject.setQueueId(booking.getQueueId());
    postpondObject.setRead(false);
    postpondObject.setRequestHandled(false);
    postpondObject.setNotificationId("" + currentTime);
    postpondObject.setNotificationType("meeting_reschedule_request");

    let finalBookingJson: any = Object.assign({}, booking);

    let bookingPostpond: BookingPostpond = new BookingPostpond();
    bookingPostpond.setRequested(true);
    bookingPostpond.setApproved(false);
    bookingPostpond.setRejected(false);
    bookingPostpond.setProcessedAt(0);
    bookingPostpond.setHandled(false);
    bookingPostpond.setRequestedAt(currentTime);
    bookingPostpond.setRequestReason(reason);
    bookingPostpond.setRescheduleDate(rescheduleDateMilli);

    booking.setPostpond(bookingPostpond);

    finalBookingJson.postpond = Object.assign({}, bookingPostpond);

    this.firestore.sendPostpondRequest(booking.getDoctorId(), Object.assign({}, postpondObject)
      , booking.getDocReference(), finalBookingJson
    )
      .then(() => {
        this.utills.showMsgSnakebar("Meeting Postpone request has been sent!");
        this.utills.hideLoading();
      })
      .catch(error => {
        console.log("Error sending postpond Notification.");
        booking.setPostpond(null);
        this.utills.hideLoading();
      });
  }

  public reasonFormatter(reason: string): string {



    if (reason === undefined || reason === null || reason.length === 0) {
      return "N/A";
    }
    if (reason.length <= 15) {
      return reason;
    } else {
      return reason.substring(0, 15) + "...";
    }
  }

  public goToQueue(booking: BookedPatient): void {

    let bundleObj: any = this.getExistingLobbyObject(booking);

    if (bundleObj !== null) {

      this.viewLobby(bundleObj);
      return;
    }



    this.utills.showLoading("Please wait..");

    let queue: QueueModel = new QueueModel();

    let doctor: DoctorUserData = new DoctorUserData();

    console.log("booking.getQueueRef() : " + booking.getQueueRef());
    console.log("booking.getDoctorRef() : " + booking.getDoctorRef());

    this.firestore.getByRef(booking.getQueueRef())
      .then(document => {

        console.log("TTYT : " + document.data());

        Object.assign(queue, document.data());



        this.firestore.getByRef(booking.getDoctorRef())
          .then(document => {

            Object.assign(doctor, document.data());

            this.searchService.getBookingsOfQueue(queue);


            const object = {
              doctor: doctor,
              queue: queue
            };

            this.viewLobby(object);

            this.utills.hideLoading();



          })
          .catch(error => {
            console.log("Error getting doctor : " + error);
            this.utills.hideLoading();

          });
      })
      .catch(error => {
        console.log("Error getting queue : " + error);
        this.utills.hideLoading();
      });

  }

  private getExistingLobbyObject(booking: BookedPatient): any {

    let queue: QueueModel = null;

    let searchedDoctor: SearchedDoctor = null;

    searchedDoctor = this.searchService.gGetDoctorById(booking.getDoctorId());
    if (searchedDoctor === null) {
      searchedDoctor = this.searchService.nGetDoctorById(booking.getDoctorId());
    }
    if (searchedDoctor === null) {
      return null;
    }

    for (let i = 0; i < searchedDoctor.getQueues().length; ++i) {
      if (searchedDoctor.getQueues()[i].getQueueId() === booking.getQueueId()) {
        queue = searchedDoctor.getQueues()[i];
        break;
      }
    }
    if (queue === null) {
      return null;
    }
    const object = {
      doctor: searchedDoctor.getDoctor(),
      queue: queue
    };

    return object;

  }

  private viewLobby(object: any): void {

    this.searchService.setCurrentQueue(object.queue);
    this.session.setSharedData(object);
    this.router.navigate(['patient/meetup-lobby']);

  }

}
