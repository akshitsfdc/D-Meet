import { Bookings } from './../models/bookings';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  constructor() { }

  private bookings:Bookings[];
  

  public loadBookings():void{

  }

  
}
