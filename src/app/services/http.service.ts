import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private server: string = 'https://us-central1-doctorclientmeetup.cloudfunctions.net/';

  constructor(private http: HttpClient) {

  }

  public getServerDate(): Promise<any> {

    return this.http.get(this.server + "serverDate").toPromise();
  }

  public getDataForPayment(endpoint: string, amount: string, currency: string): Promise<any> {

    // let headers:HttpHeaders = new HttpHeaders();
    // // headers.append('conte')
    // let params = new HttpParams();
    // params.set("amount",amount);
    // params.append("currency",currency);
    return this.http.get(this.server + endpoint, { params: { amount: amount, currency: currency } }).toPromise();

  }
}
