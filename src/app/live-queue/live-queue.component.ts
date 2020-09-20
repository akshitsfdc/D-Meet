import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { AuthService } from './../services/auth.service';

@Component({
  selector: 'app-live-queue',
  templateUrl: './live-queue.component.html',
  styleUrls: ['./live-queue.component.css']
})
export class LiveQueueComponent implements OnInit {

  live_image: String = 'dot_live.png';
  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
  }

  goToQueueDetails() {
    console.log("goToQueueDetails");
    this.router.navigate(['queueDetails'], { relativeTo: this.route });
  }

}
