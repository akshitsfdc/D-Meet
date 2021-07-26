import { ObjectHelperService } from './../../common-features/services/object-helper.service';
import { Subscription } from 'rxjs';
import { HelperService } from './../../common-features/services/helper.service';
import { PatientFirestoreService } from './../service/patient-firestore.service';
import { SearchService } from './../service/search.service';
import { BookingDialogComponent } from './../booking-dialog/booking-dialog.component';
import { CheckoutService } from './../service/checkout.service';
import { HttpService } from './../../../services/http.service';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UtilsService } from 'src/app/services/utils.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MovePatientComponent } from '../../doctor/move-patient/move-patient.component';
import { SessionService } from '../service/session.service';
import { LoadingDialogComponent } from 'src/app/loading-dialog/loading-dialog.component';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
import { QueueModel } from '../../common-features/models/queue-model';
import { BookedPatient } from '../../common-features/models/booked-patient';
import { CalculationService } from '../../common-features/services/calculation.service';
import { DoctorUserData } from '../../common-features/models/doctor-user-data';
import { PatientUserData } from '../../common-features/models/patient-user-data';


declare var Razorpay: any;

@Component({
  selector: 'app-meetup-lobby',
  templateUrl: './meetup-lobby.component.html',
  styleUrls: ['./meetup-lobby.component.scss'],
  providers: [CheckoutService]
})
export class MeetupLobbyComponent implements OnInit, OnDestroy {

  @ViewChild('bookingList') bookingListElement: ElementRef;

  // tslint:disable-next-line:no-inferrable-types
  private currentMeetingTime: number = 0;

  private bstartingInterval: NodeJS.Timeout;
  private bEndInterval: NodeJS.Timeout;
  private cstartingInterval: NodeJS.Timeout;

  private queueQuardInterval: NodeJS.Timeout;
  private currentBookingInterval: NodeJS.Timeout;
  private processingPatientId: string;
  private processingPatientSelectionTime: number;

  private doctorDataUnsubscribe;


  // tslint:disable-next-line:no-inferrable-types
  bookingavailable: boolean = false;

  disableNext = false;

  tempPatients = [];
  processedPatients = [];

  consultStarted = true;

  currentDoctor: DoctorUserData;
  currentPaient: BookedPatient;

  totalPatientSize: number;
  currentQueue: QueueModel;

  extraheight: number = 75 + 15 + 60;
  // tslint:disable-next-line:no-inferrable-types
  consultingStartWaitingTimeLabel: string = '0h:00m';

  // tslint:disable-next-line:no-inferrable-types
  bookingStartingWaitingTime: number = 0;
  // tslint:disable-next-line:ban-types
  bookingStartingWaitingTimeLabel: String = '0h:00m';

  private myWaitingTimeTimer;

  private consultingStartWaitingTime = 0;
  private loading: MatDialogRef<LoadingDialogComponent>;

  userData: PatientUserData;

  constructor(private matDialog: MatDialog,
    public util: UtilsService, public calculation: CalculationService, private httpService: HttpService,
    public session: SessionService, public utils: UtilsService,
    private checkoutService: CheckoutService,
    private firestore: PatientFirestoreService,
    public helper: HelperService,
    private objectHelper: ObjectHelperService

  ) {


  }



  ngOnInit(): void {


    this.currentQueue = this.session.getSharedData().queue as QueueModel;
    this.currentDoctor = this.session.getSharedData().doctor as DoctorUserData;
    this.userData = this.session.getUserData() as PatientUserData;

    this.startLobbyTimers();

    this.subscribeToCurrentDoctor();

  }// End of ngOnInit

  private subscribeToCurrentDoctor(): void {
    if (this.currentDoctor.getRef()) {
      this.doctorDataUnsubscribe = this.currentDoctor.getRef().onSnapshot(snapshot => {
        if (snapshot.exists) {
          const doctorUpdate: DoctorUserData = new DoctorUserData();
          Object.assign(doctorUpdate, snapshot.data());
          this.objectHelper.updateDoctor(this.currentDoctor, doctorUpdate);
        }
      });
    }
  }

  private startLobbyTimers(): void {

    this.currentQueue.setBookingStartRemaingTime(this.calculation.timeDiffrenceFromNow(this.currentQueue.getBookingStarting()) * 1000);

    this.bstartingInterval = setInterval(() => {

      if (this.currentQueue.getBookingStartRemaingTime() <= 0) {
        this.currentQueue.setBookingStartRemaingTime(0);
        clearInterval(this.bstartingInterval);
      } else {
        this.currentQueue.setBookingStartRemaingTime(this.currentQueue.getBookingStartRemaingTime() - 1000);
      }

    }, 1000);

    this.currentQueue.setConsultingStartingRemaingTime(
      this.calculation.timeDiffrenceFromNow(this.currentQueue.getConsultingStarting()) * 1000);

    this.cstartingInterval = setInterval(() => {

      if (this.currentQueue.getConsultingStartingRemaingTime() <= 0) {
        this.currentQueue.setConsultingStartingRemaingTime(0);
        clearInterval(this.cstartingInterval);
      } else {
        this.currentQueue.setConsultingStartingRemaingTime(this.currentQueue.getConsultingStartingRemaingTime() - 1000);
      }

    }, 1000);

    this.currentQueue.setBookingEndingRemaingTime(this.calculation.timeDiffrenceFromNow(this.currentQueue.getBookingEnding()) * 1000);

    this.bEndInterval = setInterval(() => {

      if (this.currentQueue.getBookingEndingRemaingTime() <= 0) {
        this.currentQueue.setBookingEndingRemaingTime(0);
        clearInterval(this.bEndInterval);
      } else {
        this.currentQueue.setBookingEndingRemaingTime(this.currentQueue.getBookingEndingRemaingTime() - 1000);
      }

    }, 1000);


    // this is generic timer which take care of queue state every 1 second
    this.queueQuardInterval = setInterval(() => {

      this.helper.setQueueSatatusMessage(this.currentQueue);
      const currentBooking: BookedPatient = this.currentQueue.getCurrentPatient();

      if (currentBooking

        && (currentBooking.getBookingId() !== this.processingPatientId
          || currentBooking.getSelectionTime() !== this.processingPatientSelectionTime) && currentBooking.getSelectionTime() > 0) {

        this.processingPatientId = currentBooking.getBookingId();
        this.processingPatientSelectionTime = currentBooking.getSelectionTime();

        if (this.currentBookingInterval) {
          clearInterval(this.currentBookingInterval);
        }
        this.setCurrentMeetingTime(currentBooking);
      }

    }, 500);

  }


  private setCurrentMeetingTime(booking: BookedPatient): void {



    this.currentMeetingTime = this.calculation.getTimePassed(booking.getSelectionTime()) * 1000;

    this.currentBookingInterval = setInterval(() => {
      this.currentMeetingTime += 1000;
    }, 1000);

  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngAfterViewInit(): void {

    const windowHeight = window.innerHeight;
    // this.bookingListElement.nativeElement.style.height = 50 +'px';    // set height
    this.bookingListElement.nativeElement.style.height = (windowHeight - this.extraheight) + 'px';
  }

  @HostListener('window:resize', ['$event'])
  onResize(event): void {
    const windowHeight = window.innerHeight;
    this.bookingListElement.nativeElement.style.height = (windowHeight - this.extraheight) + 'px';
  }
  initConsultingWaitingTime(): void {
    setInterval(() => {
      this.consultingStartWaitingTime -= 60000;
      this.consultingStartWaitingTimeLabel = this.util.getDateDigits(this.consultingStartWaitingTime);
      console.log(this.consultingStartWaitingTimeLabel);
    }, 60000);
  }

  private async bookNow(phoneNumber: string, from: string): Promise<void> {

    this.showLoading();
    let bookingAllowed: boolean;
    let serverDate: any;

    await this.httpService.getServerDate()
      .then(dateObjs => {
        serverDate = dateObjs;
        bookingAllowed = this.calculation.isWithinRangeServer(this.currentQueue.getBookingStarting(),
          this.currentQueue.getBookingEnding(), dateObjs.timestapmUTC);

      })
      .catch(error => {
        console.log('Error ' + error);
        bookingAllowed = false;
      });

    if (!bookingAllowed) {

      this.showDialog('fail', 'This queue is no longer available for booking today. Please check your system date and time, in case you got any false availability of this queue. Or contact support if you have any further issue.', 'Ok');
      this.hideLoading();
      return;
    }

    const checkoutobject: any = this.checkoutService.getPaymentOptionObject();
    checkoutobject.amount = this.currentQueue.getFees() * 100;
    checkoutobject.currency = 'INR';
    checkoutobject.name = this.currentDoctor.getFirstName() + ' ' + this.currentDoctor.getLastName() + ' - Appointment';

    checkoutobject.prefill.name = this.userData.getFirstName() + ' ' + this.userData.getLastName();
    checkoutobject.prefill.email = this.userData.getEmail();
    checkoutobject.prefill.contact = phoneNumber;

    checkoutobject.handler = (response) => {
      this.processPaymentSuccess(phoneNumber, from, response, serverDate);
    };

    this.getOrderId().then(data => {

      if (data && data.status === 'success') {
        const order: any = data.order;
        checkoutobject.order_id = order.id;

        this.hideLoading();

        this.checkout(checkoutobject);


      } else {
        console.log('Got error resonse !' + JSON.stringify(data));
        this.hideLoading();
      }
    })
      .catch(error => {
        // error
        console.log('error : ' + JSON.stringify(error));
        this.hideLoading();

      });


  }

  private getOrderId(): Promise<any> {
    return this.checkoutService.createOrderId((this.currentQueue.getFees() * 100).toString(), 'INR');
  }

  private checkout(options): void {

    const rzp1 = new Razorpay(options);

    rzp1.on('payment.failed', (response) => {
      this.processPaymentError(response);
    });

    try {
      rzp1.open();
    } catch {

    }


  }

  private processPaymentSuccess(phoneNumber, from, response, serverDate: any): void {

    this.showLoading();


    const bookedPaitient: BookedPatient = this.objectHelper.getNewBookingObject(this.userData,
      this.currentQueue,
      this.currentDoctor,
      response,
      serverDate);

    this.firestore.saveBooking(this.helper.getDateStringForQuery(+serverDate.timestapmUTC), Object.assign({}, bookedPaitient))
      .then(() => {
        this.showDialog('success',
          'Your appointment has been registered successfully. You can now track your booking on this lobby.', 'Ok');
        this.hideLoading();
      })
      .catch(error => {
        console.log('Error in transaction!');
        this.showDialog('fail', 'Something went wrong. We could not book your appointment at this time. Please contact support, if you have any query', 'Ok');
        this.hideLoading();
      });


  }


  private showDialog(type: string, msg: string, ok: string): void {

    const dialogData = {
      type,
      message: msg,
      okText: ok
    };

    this.matDialog.open(MessageDialogComponent, {
      data: dialogData, disableClose: false,
      maxWidth: '300px'
    }).afterClosed().toPromise()
      .then(result => {

      });
  }


  private processPaymentError(response): void {
    console.log('payment Failed : ' + JSON.stringify(response));
  }


  private saveMyBooking(): void {
    // this.firestore.save('queue-bookings');
  }


  openBookingDialog(): void {

    const dialogData = {
      maxPosition: this.tempPatients.length,
      minPosition: this.tempPatients.length > 2 ? 2 : this.tempPatients.length
    };


    const dialog = this.matDialog.open(BookingDialogComponent,
      { minWidth: '300px', maxWidth: '500px', maxHeight: '600px', disableClose: true, data: dialogData });

    dialog.afterClosed().subscribe(result => {

      if (result && !result.canceled) {

        if (result.paying) {
          this.bookNow(result.phoneNumber, result.city);
        } else {
          // this.hideLoading();
        }
      }



    });
  }

  private showLoading(): void {

    // this.loading = this.matDialog.open(LoadingDialogComponent, { disableClose: true });
    this.utils.showLoading('Please wait...');

  }
  private hideLoading(): void {
    this.utils.hideLoading();
  }

  bookingAvailability(): void {
    this.currentQueue.setBookingAvailable(
      this.calculation.isWithinRange(this.currentQueue.getBookingStarting(), this.currentQueue.getBookingEnding()));
  }
  consultingStarted(): void {
    this.currentQueue.setConsultingStarted(
      this.calculation.isWithinRange(this.currentQueue.getConsultingStarting(), this.currentQueue.getConsultingEnding()));
  }

  startTimerCounter(): void {
    this.myWaitingTimeTimer = setInterval(() => {
      this.changeSelfWaitingTime();
    }, 1000);


  }


  changeSelfWaitingTime(): void {

    if (this.currentQueue.getBookings().length > 0 && this.currentQueue.getMyBooking()) {
      this.currentQueue.getMyBooking().setSelfWaitingTime(+new Date());
    }
  }

  ngOnDestroy(): void {
    if (this.myWaitingTimeTimer) {
      clearInterval(this.myWaitingTimeTimer);
    }

    if (this.bstartingInterval) {
      clearInterval(this.bstartingInterval);
    }
    if (this.cstartingInterval) {
      clearInterval(this.cstartingInterval);
    }
    if (this.bEndInterval) {
      clearInterval(this.bEndInterval);
    }
    if (this.doctorDataUnsubscribe) {
      this.doctorDataUnsubscribe();
    }

    if (this.queueQuardInterval) {
      clearInterval(this.queueQuardInterval);
    }
  }
}
