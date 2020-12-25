import { SearchService } from './../service/search.service';
import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private searchService:SearchService) { 
    
  }

  ngOnInit(): void {
    this.loadDoctorData();
  }

  private loadDoctorData():void{

    this.searchService.loadDoctors();
    
  }

}
