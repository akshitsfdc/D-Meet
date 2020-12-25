import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private server:string = 'https://us-central1-doctorclientmeetup.cloudfunctions.net/';

  constructor(private http: HttpClient) { 

  }

  public getServerDate(endpoint:string):Promise<any>{
    return this.http.get(this.server+endpoint).toPromise();
  }
}
