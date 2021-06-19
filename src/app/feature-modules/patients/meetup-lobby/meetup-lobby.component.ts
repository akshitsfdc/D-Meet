import { Subscription } from 'rxjs';
import { HelperService } from './../../common-features/services/helper.service';
import { PatientFirestoreService } from './../service/patient-firestore.service';
import { SearchService } from './../service/search.service';
import { PatientUserData } from './../../../models/patient-user-data';
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
  private selfWaitingInterval: NodeJS.Timeout;
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

  movies = [
    'Episode I - The Phantom Menace',
    'Episode II - Attack of the Clones',
    'Episode III - Revenge of the Sith',
    'Episode IV - A New Hope',
    'Episode V - The Empire Strikes Back',
    'Episode VI - Return of the Jedi',
    'Episode VII - The Force Awakens',
    'Episode VIII - The Last Jedi',
    'Episode IV - A New Hope',
    'Episode I - The Phantom Menace',
    'Episode II - Attack of the Clones',
    'Episode III - Revenge of the Sith',
    'Episode IV - A New Hope',
    'Episode V - The Empire Strikes Back',
    'Episode VI - Return of the Jedi',
    'Episode VII - The Force Awakens',
    'Episode VIII - The Last Jedi',
    'Episode IV - A New Hope',
    'Episode III - Revenge of the Sith',
    'Episode IV - A New Hope',
    'Episode V - The Empire Strikes Back',
    'Episode VI - Return of the Jedi',
    'Episode VII - The Force Awakens',
    'Episode VIII - The Last Jedi',
    'Episode IV - A New Hope',
    'Episode I - The Phantom Menace',
    'Episode II - Attack of the Clones',
    'Episode III - Revenge of the Sith',
    'Episode IV - A New Hope',
    'Episode V - The Empire Strikes Back',
    'Episode VI - Return of the Jedi',
    'Episode VII - The Force Awakens',
    'Episode VIII - The Last Jedi',
    'Episode IV - A New Hope',

  ];

  private myWaitingTimeTimer;

  private consultingStartWaitingTime = 0;
  private loading: MatDialogRef<LoadingDialogComponent>;

  userData: PatientUserData;

  constructor(private matDialog: MatDialog,
    public util: UtilsService, public calculation: CalculationService, private httpService: HttpService,
    public session: SessionService, public utils: UtilsService,
    private checkoutService: CheckoutService, private firestore: PatientFirestoreService, public helper: HelperService) {


  }



  ngOnInit(): void {


    this.currentQueue = this.session.getSharedData().queue;
    this.currentDoctor = this.session.getSharedData().doctor;
    this.userData = this.session.getUserData();

    this.startLobbyTimers();

    this.subscribeToCurrentDoctor();

  }// End of ngOnInit

  private subscribeToCurrentDoctor(): void {
    if (this.currentDoctor.getRef()) {
      this.doctorDataUnsubscribe = this.currentDoctor.getRef().onSnapshot(snapshot => {
        if (snapshot.exists) {
          const doctorUpdate: DoctorUserData = new DoctorUserData();
          Object.assign(doctorUpdate, snapshot.data());
          this.helper.updateDoctor(this.currentDoctor, doctorUpdate);
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

      const mybooking: BookedPatient = this.currentQueue.getMyBooking();
      const currentBooking: BookedPatient = this.currentQueue.getCurrentPatient();

      if (mybooking && !this.selfWaitingInterval) {
        if (mybooking.isProcessed() || mybooking.isCancelled()) {
          mybooking.setSelfWaitingTime(0);
        } else {
          this.setSelfWaitingTime(mybooking);
        }

      }

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

    }, 1000);

  }


  private setCurrentMeetingTime(booking: BookedPatient): void {



    this.currentMeetingTime = this.calculation.getTimePassed(booking.getSelectionTime()) * 1000;

    this.currentBookingInterval = setInterval(() => {
      this.currentMeetingTime += 1000;
    }, 1000);

  }

  private setSelfWaitingTime(booking: BookedPatient): void {

    console.log('My booking timer set');

    booking.setSelfWaitingTime(this.calculation.getRemainingTimeBeforeMeeting(this.currentQueue, booking));

    this.selfWaitingInterval = setInterval(() => {

      const timeLeft = booking.getSelfWaitingTime() - 1000;

      if (timeLeft <= 0) {
        booking.setSelfWaitingTime(0);
        booking.setSelfWaitingTimeString('about to start...');
        clearInterval(this.selfWaitingInterval);
        // this.selfWaitingInterval = undefined;
      } else {
        booking.setSelfWaitingTime(timeLeft);
        booking.setSelfWaitingTimeString(this.calculation.getRemainingTimeString(timeLeft));
      }


    }, 1000);

  }

  private setCurrentMeetingTimeSpent(booking: BookedPatient): void {

    console.log('My booking timer set');

    booking.setSelfWaitingTime(this.calculation.getRemainingTimeBeforeMeeting(this.currentQueue, booking));

    this.selfWaitingInterval = setInterval(() => {

      const timeLeft = booking.getSelfWaitingTime() - 1000;

      if (timeLeft <= 0) {
        booking.setSelfWaitingTime(0);
        booking.setSelfWaitingTimeString('about to start...');
        clearInterval(this.selfWaitingInterval);
        // this.selfWaitingInterval = undefined;
      } else {
        booking.setSelfWaitingTime(timeLeft);
        booking.setSelfWaitingTimeString(this.calculation.getRemainingTimeString(timeLeft));
      }


    }, 1000);

  }

  private setTimerForAvailability(): void {

    setInterval(() => {
      this.bookingAvailability();
      this.consultingStarted();
    }, 60000);
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

  initBookingWaitingTime(): void {
    setInterval(() => {
      this.bookingStartingWaitingTime -= 60000;
      this.bookingStartingWaitingTimeLabel = this.util.getDateDigits(this.bookingStartingWaitingTime);
      console.log(this.bookingStartingWaitingTime);
    }, 60000);
  }
  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.movies, event.previousIndex, event.currentIndex);
  }

  goPatientMeet(): void {
    // this.router.navigate(['patientMeet'], { relativeTo: this.route });
    this.saveData();
  }


  nextPatient(): void {

    this.processedPatients.push(this.currentPaient);

    if (this.tempPatients.length > 0) {
      this.currentPaient = this.tempPatients.splice(0, 1)[0];
    }

    if (this.processedPatients.length === this.totalPatientSize) {
      // this.processedPatients.push(this.currentPaient);
      // this.currentPaient = this.tempPatients.splice(0, 1)[0];
      this.disableNext = true;
    }

  }
  movePatient(): void {

    const dialogData = {
      maxPosition: this.tempPatients.length,
      minPosition: this.tempPatients.length > 2 ? 2 : this.tempPatients.length
    };


    const dialog = this.matDialog.open(MovePatientComponent, { data: dialogData });

    dialog.afterClosed().subscribe(result => {

      if (result && !result.canceled) {
        if (result.defined) {
          this.shiftPatientToPosition(result.position);
        } else {
          this.shiftPatientToLast();
        }
      }



    });
  }

  private shiftPatientToPosition(position: number): void {

    if (this.tempPatients.length > 0) {
      this.tempPatients.splice(position, 0, this.currentPaient);
      this.currentPaient = this.tempPatients.splice(0, 1)[0];
    }

  }

  private shiftPatientToLast(): void {

    if (this.tempPatients.length > 0) {
      this.tempPatients.splice(this.tempPatients.length, 0, this.currentPaient);
      this.currentPaient = this.tempPatients.splice(0, 1)[0];
    }


  }
  // statusChanged() {
  //   switch (this.selectedStatus) {
  //     case "live": {
  //       this.selectStatusDisplay = "Live";
  //       break;
  //     }
  //     case "offline": {
  //       this.selectStatusDisplay = "Offline";
  //       break;
  //     }
  //     default: {
  //       this.selectStatusDisplay = "Away";
  //       break;
  //     }
  //   }
  // }

  private saveData(): void {
    // const roomRef = this.firestore.collection('doctor-meta').doc((+ new Date()).toString());
    // roomRef.set(this.getCitydata());

    // const coollection = this.firestore.collection('cities');
    // this.firestore
    // .collection('cities', ref => ref.where("state", "==", "Uttar Pradesh").where("country", "==", "India"))
    // .get().toPromise().then((querySnapshot) => {
    //   querySnapshot.forEach((doc) => {
    //        console.log(doc.id, "=>", doc.data());
    //   });
    // });
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

    // this.httpService.getServerDate()

    //   .then(serverDate => {

    const bookedPaitient: BookedPatient = new BookedPatient();

    const name: string = this.userData.getFirstName() + ' ' + this.userData.getLastName();


    bookedPaitient.setName(name);
    bookedPaitient.setPicUrl(this.userData.getPicUrl());
    bookedPaitient.setAge(this.userData.getAge());
    bookedPaitient.setFrom(from);
    bookedPaitient.setPhone(phoneNumber);
    bookedPaitient.setStatus('online');
    bookedPaitient.setQueuePlace(this.currentQueue.getBookings().length + 1);
    bookedPaitient.setBookingTime(+Date.now());
    bookedPaitient.setBookingId((+Date.now()).toString());
    bookedPaitient.setQueueId(this.currentQueue.getQueueId());
    bookedPaitient.setDoctorId(this.currentDoctor.getUserId());
    bookedPaitient.setDoctorName(this.currentDoctor.getFirstName() + ' ' + this.currentDoctor.getLastName());
    // bookedPaitient.setPaymentInfo(paymentInfo);
    bookedPaitient.setPaymentId(response.razorpay_payment_id || '');
    bookedPaitient.setOrderId(response.razorpay_order_id || '');
    bookedPaitient.setSignature(response.razorpay_signature || '');
    bookedPaitient.setPatientId(this.userData.getUserId());
    bookedPaitient.setCurrentPatient(false);
    bookedPaitient.setPending(false);
    bookedPaitient.setProcessed(false);
    bookedPaitient.setCancelled(false);
    bookedPaitient.setCancelledBy('');
    bookedPaitient.setPostpond(null);
    bookedPaitient.setDoctorRef(this.currentDoctor.getRef());
    bookedPaitient.setQueueRef(this.currentQueue.getDocRef());

    const date: Date = new Date(+serverDate.timestapmUTC);

    const dateStr = date.getDate() + '' + date.getMonth() + '' + date.getFullYear();

    bookedPaitient.setDateString(dateStr);



    bookedPaitient.setBookingTimeServer(+serverDate.timestapmUTC);



    this.firestore.saveBooking(dateStr, Object.assign({}, bookedPaitient))
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
  }
}
