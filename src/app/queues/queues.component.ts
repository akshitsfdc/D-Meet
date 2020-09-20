import { QueueModel } from './../models/queue-model';
import { Component, OnInit } from '@angular/core';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';

@Component({
  selector: 'app-queues',
  templateUrl: './queues.component.html',
  styleUrls: ['./queues.component.css']
})
export class QueuesComponent {

  queues : any[] = [];

  bookEndMin;

  darkTheme: NgxMaterialTimepickerTheme = {
    container: {
        bodyBackgroundColor: '#424242',
        buttonColor: '#fff'
    },
    dial: {
        dialBackgroundColor: '#555',
    },
    clockFace: {
        clockFaceBackgroundColor: '#555',
        clockHandColor: '#0F9D58',
        clockFaceTimeInactiveColor: '#fff'
    }
};
  constructor() { 
    this.getQueues();
  }

  private getQueues(): void{

    for(let i = 0; i < 10; ++i){
      let queue : QueueModel = new QueueModel();

      queue.status = "Processed";
      queue.queueId = "12345";
      queue.patientLimit = 34 + i ;
      queue.ownerId = "123456789";
      queue.fees = 501 - i ; 
      queue.consultingStarting = "12:30 AM";
      queue.bookingStarting = "9 : 30 AM";
      queue.bookedPatients = 0;

      this.queues.push(queue);
    }
  }
  timeChangeBookStart(event){
    console.log(JSON.stringify(event));
    this.bookEndMin = event;
  }

}
