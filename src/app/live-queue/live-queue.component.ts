import { BankKycFormComponent } from './../bank-kyc-form/bank-kyc-form.component';
import { PaymentRecievedModel } from './../models/payment-recieved-model';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { AuthService } from './../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { FirestoreService } from '../services/firestore.service';

@Component({
  selector: 'app-live-queue',
  templateUrl: './live-queue.component.html',
  styleUrls: ['./live-queue.component.css'],
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
  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute, private matDialog: MatDialog, private server:FirestoreService) { }

  dataSource;
  columnsToDisplay = ['amount', 'name', 'email', 'queue', 'contact', 'created at', 'status'];
  expandedElement: PaymentRecievedModel | null;
  isVarified = false;
  isKYCFilled = false;

  columnMapper = {
    amount : "convertedAmount",
    name : "payeeName",
    email : "payeeEmail",
    queue : "queueId",
    contact : "payeeContact",
    "created at" : "convertedTime",
    status : "status"
  };


  ngOnInit(): void {
    this.dataSource = this.getMockPaymentData();
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



}



