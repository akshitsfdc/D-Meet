import { MeetupLobbyComponent } from './meetup-lobby/meetup-lobby.component';
import { MeetingsComponent } from './meetings/meetings.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConferenceComponent } from './conference/conference.component';
import { BaseComponent } from './base/base.component';
import { MainNavigationComponent } from './main-navigation/main-navigation.component';


const routes: Routes = [

  {
    path: '', component: BaseComponent,
    children: [
      {
        path: '', component: MainNavigationComponent,
    
        children: [
          {
            path: 'home', component: DashboardComponent
          },
          {
            path: 'meetup-lobby', component: MeetupLobbyComponent
          },
          {
            path: 'meetings', component: MeetingsComponent
          }
        ]
      },
      {
        path: 'conference', component: ConferenceComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientsRoutingModule { 


}
