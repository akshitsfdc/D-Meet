import { DoctorUserData } from './../models/doctor-user-data';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {


  private doctorUserData: DoctorUserData;

  constructor() { 

    this.doctorUserData = new DoctorUserData();

  }

  public getDoctorUserData(): DoctorUserData {
    return this.doctorUserData;
  }

  public setDoctorUserData(doctorUserData: DoctorUserData): void {
      this.doctorUserData = doctorUserData;
  }
  
  
}
