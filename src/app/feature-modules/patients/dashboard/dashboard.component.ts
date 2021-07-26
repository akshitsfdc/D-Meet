import { HelperService } from './../../common-features/services/helper.service';
import { CalculationService } from '../../common-features/services/calculation.service';
import { DoctorUserData } from './../../../models/doctor-user-data';
import { SessionService } from './../service/session.service';
import { Router } from '@angular/router';
import { UtilsService } from './../../../services/utils.service';
import { SearchedDoctor } from './../models/searched-doctor';
import { SearchService } from './../service/search.service';
import { FirestoreService } from './../../../services/firestore.service';
import { Component, OnInit } from '@angular/core';
import { QueueModel } from '../../common-features/models/queue-model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  // doctorArray = [1, 2, 3, 4, 5];
  // sessionQueues = [1, 2 ,3];
  holidayList = ['Sunday', 'Saturday'];

  constructor(public searchService: SearchService,
    public helper: HelperService,
    public utils: UtilsService,
    public calculation: CalculationService,
    private router: Router,
    private session: SessionService) {


  }

  ngOnInit(): void {

  }
  onScroll(): void {
    console.log('Scrolled!');
  }

  bookingPannelExpended(searchedDoctor: SearchedDoctor): void {
    if (!searchedDoctor.isQueueLoading() && !searchedDoctor.isQueueInitialized()) {
      this.searchService.setDoctorQueues(searchedDoctor);
    }
  }

  viewLobby(queue: QueueModel, doctor: DoctorUserData): void {

    const object = {
      doctor,
      queue
    };

    this.searchService.setCurrentQueue(queue);
    this.session.setSharedData(object);
    this.router.navigate(['patient/meetup-lobby']);
  }

}
