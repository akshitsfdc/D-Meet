import { DoctorHelperService } from './../services/doctor-helper.service';
import { CalculationService } from './../../common-features/services/calculation.service';
import { HelperService } from './../../common-features/services/helper.service';
import { PrescriptionDialogComponent } from '../../../prescription-dialog/prescription-dialog.component';

import { UtilsService } from '../../../services/utils.service';
import { SessionService } from '../services/session.service';
import { BankKycFormComponent } from '../bank-kyc-form/bank-kyc-form.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FirestoreService } from 'src/app/services/firestore.service';

import { PaymentRecievedModel } from '../models/payment-recieved-model';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
import { QueueModel } from '../../common-features/models/queue-model';

declare var google: any;
@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class DashboardComponent implements OnInit {

  // tslint:disable-next-line:variable-name
  public live_image;

  public innerWidth: number;

  public dataSource: PaymentRecievedModel[];
  public columnsToDisplay;
  public expandedElement: PaymentRecievedModel | null;
  public isVarified: boolean = false;
  public isKYCFilled: boolean = false;

  columnMapper = {
    amount: 'convertedAmount',
    'payment Id': 'payeeName',
    email: 'payeeEmail',
    queue: 'queueId',
    contact: 'payeeContact',
    'created at': 'convertedTime',
    status: 'status'
  };

  constructor(private router: Router,
    private route: ActivatedRoute,
    private matDialog: MatDialog,
    private server: FirestoreService,
    public utils: UtilsService,
    public session: SessionService,
    public helper: HelperService,
    public doctorHelper: DoctorHelperService,
    public calculation: CalculationService) {

    this.columnsToDisplay = ['amount', 'payment Id', 'created at', 'status'];
    this.isKYCFilled = false;
    this.isVarified = false;
    this.live_image = 'dot_live.png';
  }

  ngOnInit(): void {

    this.graphInit();




  }

  private graphInit(): void {

    const width = window.innerWidth;

    if (this.isMobile()) {
      this.innerWidth = width;
    } else {
      this.innerWidth = width - (width * .20);
    }
    this.dataSource = this.getMockPaymentData();
    console.log('today : ', this.utils.getDay(+new Date()));
    google.charts.load('current', { packages: ['corechart', 'line'] });
    google.charts.setOnLoadCallback(
      () => {

        const data = new google.visualization.DataTable();
        data.addColumn('number');
        data.addColumn('number');

        data.addRows([
          [0, 0], [1, 10], [2, 23], [3, 17], [4, 18], [5, 9]
        ]);

        // let width = this.innerWidth;
        const options = {
          width: this.innerWidth,
          height: 300,
          chartArea: { width: '100%', height: '80%' }
        };

        const chart = new google.visualization.LineChart(document.getElementById('graphContent'));

        chart.draw(data, options);

      }


    );
  }

  @HostListener('window:resize', ['$event'])
  onResize(event): void {

    const width = event.target.innerWidth;

    if (this.isMobile()) {
      this.innerWidth = width;
    } else {
      this.innerWidth = width - (width * .20);
    }


    const data = new google.visualization.DataTable();
    data.addColumn('number', 'X');
    data.addColumn('number');

    data.addRows([
      [0, 0], [1, 10], [2, 23], [3, 17], [4, 18], [5, 9]
    ]);

    // let width = this.innerWidth;
    const options = {
      width: this.innerWidth,
      height: 300,
      chartArea: { width: '100%', height: '80%' }
    };

    const chart = new google.visualization.LineChart(document.getElementById('graphContent'));

    chart.draw(data, options);

  }
  private isMobile(): boolean {
    const match = window.matchMedia;
    if (match) {
      const mq = match('(pointer:coarse)');
      return mq.matches;
    }
    return false;
  }

  goToQueueDetails(): void {
    console.log('goToQueueDetails');
    this.router.navigate(['queueDetails'], { relativeTo: this.route });
  }

  private getMockPaymentData(): PaymentRecievedModel[] {

    const paymentArray: PaymentRecievedModel[] = [];

    for (let i = 0; i < 100; ++i) {
      const payment: PaymentRecievedModel = new PaymentRecievedModel();
      payment.setPayeeName('Payee ' + i);
      payment.setPayeeEmail('email@gmail.com' + i);
      payment.setPayeeContact('888898513' + i);
      payment.setQueueId('xxyytz ' + i);
      payment.setTime(98989 + i);
      payment.setConvertedTime('16 oct 2020 7:10 AM');
      payment.setConvertedAmount('520 rs');
      if ((i % 2) === 0) {
        payment.setStatus('Authorized');
      } else {
        payment.setStatus('Completed');
      }
      paymentArray.push(payment);
    }
    return paymentArray;
  }

  openKycForm(): void {

    const dialogData = {

    };


    const dialog = this.matDialog.open(BankKycFormComponent, { data: dialogData, disableClose: true });

    dialog.afterClosed().subscribe(result => {

      if (result && !result.canceled) {

      }

    });
  }

  private showDialog(type: string, msg: string, ok: string, queue: QueueModel): void {

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
        if (queue !== null && result.approved) {
          this.deleteQueue(queue);
        }

      });
  }


  private deleteQueue(queue: QueueModel): void {
    this.server.delete('users/' + this.session.getUserData().getUserId() + '/queues', queue.getQueueId())
      .then(() => {

      })
      .catch(error => {
        this.showDialog('fail', 'Could not delete queue at this time please try again. If you keep getting this error, please contact support at support@doctormeetup.com', 'Close', null);
      });
  }
  queueStatusChanged(queue: QueueModel): void {

    queue.setLoading(true);
    this.server.update('users/' + this.session.getUserData().getUserId() + '/queues', queue.getQueueId(), { active: !queue.isActive() })
      .then(() => {
        console.log('Queue status changed success!');

        queue.setLoading(false);
      })
      .catch(error => {
        // error
        console.log('Queue status changed failed!');
        queue.setLoading(false);
      });

  }

  deletClick(queue: QueueModel): void {
    this.showDialog('alert', 'Are you sure, you want to delete your queue?', 'Yes', queue);
  }
  editQueue(queue: QueueModel): void {

    this.session.setSharedData(queue);

    this.router.navigate(['doctor/queues/editQueue']);

  }
  openQueue(queue: QueueModel): void {

    const data = {
      queue,
      doctor: this.session.getUserData()
    };
    this.session.setSharedData(data);
    this.router.navigate(['doctor/meetup-lobby']);
  }

}



