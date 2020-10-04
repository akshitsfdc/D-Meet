import { QueueModel } from './../models/queue-model';
import { Component } from '@angular/core';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-queues',
  templateUrl: './queues.component.html',
  styleUrls: ['./queues.component.css']
})
export class QueuesComponent {

  queues : any[] = [];

  
  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) { 
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

  goToCreateQueue() {
    this.router.navigate(['createQueue'], { relativeTo: this.route });
  }

  
}
