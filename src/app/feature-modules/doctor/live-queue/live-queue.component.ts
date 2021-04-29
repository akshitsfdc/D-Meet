import { PrescriptionDialogComponent } from './../../../prescription-dialog/prescription-dialog.component';
import { QueueModel } from './../models/queue-model';
import { UtilsService } from './../../../services/utils.service';
import { SessionService } from './../services/session.service';
import { BankKycFormComponent } from './../bank-kyc-form/bank-kyc-form.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/services/auth.service';
import { PaymentRecievedModel } from '../models/payment-recieved-model';
import { MatSpinner } from '@angular/material/progress-spinner';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
import { DoctorUserData } from 'src/app/models/doctor-user-data';

declare var google:any;
@Component({
  selector: 'app-live-queue',
  templateUrl: './live-queue.component.html',
  styleUrls: ['./live-queue.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class LiveQueueComponent implements OnInit {

  live_image: String = 'dot_live.png';

  innerWidth;

  dataSource;
  columnsToDisplay = ['amount', 'payment Id', 'created at', 'status'];
  expandedElement: PaymentRecievedModel | null;
  isVarified = false;
  isKYCFilled = false;
   
  columnMapper = {
    amount : "convertedAmount",
    'payment Id' : "payeeName",
    email : "payeeEmail",
    queue : "queueId",
    contact : "payeeContact",
    "created at" : "convertedTime",
    status : "status"
  };

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute, private matDialog: MatDialog, private server:FirestoreService
    , public utils:UtilsService, public session:SessionService) { }

  ngOnInit(): void {

    this.graphInit();

    

    
  }

  private graphInit(){

    let width = window.innerWidth;

    if(this.isMobile()){
      this.innerWidth = width;
    }else{
      this.innerWidth = width - (width * .20);
    }
    this.dataSource = this.getMockPaymentData();
    console.log("today : ",this.utils.getDay(+new Date()));
    google.charts.load('current', {'packages':['corechart', 'line']});
    google.charts.setOnLoadCallback(
     () => {

      var data = new google.visualization.DataTable();
      data.addColumn('number');
      data.addColumn('number');

      data.addRows([
        [0, 0],   [1, 10],  [2, 23],  [3, 17],  [4, 18],  [5, 9]
      ]);

      // let width = this.innerWidth;
      var options = {
        'width': this.innerWidth,
        height: 300,
        'chartArea': {'width': '100%', 'height': '80%'}
      };

    var chart = new google.visualization.LineChart(document.getElementById('graphContent'));

    chart.draw(data, options);

     }
      
      
    );
  }
  
  @HostListener('window:resize', ['$event'])
  onResize(event){

    let width = event.target.innerWidth;

    if(this.isMobile()){
      this.innerWidth = width;
    }else{
      this.innerWidth = width - (width * .20);
    }
   

    var data = new google.visualization.DataTable();
      data.addColumn('number', 'X');
      data.addColumn('number');

      data.addRows([
        [0, 0],   [1, 10],  [2, 23],  [3, 17],  [4, 18],  [5, 9]
      ]);

      // let width = this.innerWidth;
      var options = {
        width: this.innerWidth,
        height: 300,
        'chartArea': {'width': '100%', 'height': '80%'}
      };

    var chart = new google.visualization.LineChart(document.getElementById('graphContent'));

    chart.draw(data, options);

  }
  private isMobile() {
    var match = window.matchMedia;
    if(match) {
        var mq = match("(pointer:coarse)");
        return mq.matches;
    }
    return false;
}

  private getUserData(){
    // this.server.getData("").subscribe
  }
  goToQueueDetails() {
    console.log("goToQueueDetails");
    this.router.navigate(['queueDetails'], { relativeTo: this.route });
  }

  private  getMockPaymentData():PaymentRecievedModel[]{

    let paymentArray:PaymentRecievedModel[] = [];
    
    for(let i = 0; i < 100; ++i ){
      let payment:PaymentRecievedModel = new PaymentRecievedModel();
      payment.setPayeeName("Payee "+i);
      payment.setPayeeEmail("email@gmail.com"+i);
      payment.setPayeeContact("888898513"+i);
      payment.setQueueId("xxyytz "+i);
      payment.setTime(98989+i);
      payment.setConvertedTime("16 oct 2020 7:10 AM");
      payment.setConvertedAmount("520 rs");
      if((i%2) == 0){
        payment.setStatus("Authorized");
      }else{
        payment.setStatus("Completed");
      }
      paymentArray.push(payment)
    }
    return paymentArray;
  }

  openKycForm(){

    let dialogData = {
      
    }
    

    let dialog = this.matDialog.open(BankKycFormComponent, {data: dialogData , disableClose: true});
    
    dialog.afterClosed().subscribe(result => {

      if(result && !result.canceled){
          
      }
      
    });
  }

  private showDialog(type:string, msg:string, ok:string, queue:QueueModel):void{

    let dialogData = {
      type : type,
      message : msg,
      okText: ok
    }

    this.matDialog.open(MessageDialogComponent, {data: dialogData , disableClose: false,
      maxWidth : '300px'
    }).afterClosed().toPromise()
    .then(result => {
      if(queue !==null && result.approved){
        this.deleteQueue(queue);
      }
      
    });
  }


  private deleteQueue(queue:QueueModel):void{
    this.server.delete("user-data/"+this.session.getUserData().getUserId()+"/queues", queue.getQueueId())
    .then(() => {
     
    })
    .catch(error => {
      this.showDialog('fail', 'Could not delete queue at this time please try again. If you keep getting this error, please contact support at support@doctormeetup.com', 'Close',null);
    });
  }
  queueStatusChanged(queue:QueueModel){
    
    queue.setLoading(true);   
    this.server.update('user-data/'+this.session.getUserData().getUserId()+'/queues', queue.getQueueId(), {"active": !queue.isActive()})
      .then(() => {
        console.log("Queue status changed success!");
        
      queue.setLoading(false);
    })
    .catch(error => {
      //error
      console.log("Queue status changed failed!");
      queue.setLoading(false);     
    });
    
  }

  deletClick(queue:QueueModel):void{
    this.showDialog('alert', 'Are you sure, you want to delete your queue?','Yes' , queue);
  }
  editQueue(queue:QueueModel):void{

    this.session.setSharedData(queue);

    this.router.navigate(['doctor/queues/editQueue']);
    
  }
  openQueue(queue: QueueModel): void{
    
    let data = {
      queue: queue,
      doctor: this.session.getUserData()
    }
    this.session.setSharedData(data);
    this.router.navigate(['doctor/meetup-lobby']);
  }

  
  private showPrescription() {

    this.matDialog.open(PrescriptionDialogComponent, { maxWidth:'560px', width:'560px',

      data: { doctor: this.session.getUserData() }
    
    }).afterClosed().toPromise()
    .then(result => {
      
    });
  }

}



