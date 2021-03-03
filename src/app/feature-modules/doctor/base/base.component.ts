import { Router, NavigationEnd } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.css'],
  providers:[SessionService]
})
export class BaseComponent implements OnInit {

  constructor(private router:Router) { }

  ngOnInit(): void {

    this.router.navigate(['doctor/dashboard']);
  }


}
