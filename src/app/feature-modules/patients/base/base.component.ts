import { CheckoutService } from './../service/checkout.service';
import { SearchService } from './../service/search.service';
import { Component, OnInit } from '@angular/core';
import { SessionService } from '../service/session.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.css'],
  providers:[SessionService, SearchService, CheckoutService]
})
  
export class BaseComponent implements OnInit {

  constructor(private router:Router) { }

  ngOnInit(): void {
    this.router.navigate(['patient/home']);
  }

}
