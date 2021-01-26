import { Bookings } from './../models/bookings';
import { Injectable } from '@angular/core';
import { QueueModel } from 'src/app/models/queue-model';
import { BookedPatient } from 'src/app/models/booked-patient';
import { FirestoreService } from 'src/app/services/firestore.service';
import { UtilsService } from 'src/app/services/utils.service';
import { HttpService } from 'src/app/services/http.service';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  

  constructor(private firestore:FirestoreService, private utils: UtilsService, private http:HttpService, private session:SessionService) { }

  

  

  
}
