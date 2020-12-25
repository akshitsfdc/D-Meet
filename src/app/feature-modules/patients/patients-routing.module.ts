import { MeetupLobbyComponent } from './meetup-lobby/meetup-lobby.component';
import { MeetingsComponent } from './meetings/meetings.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';


const routes: Routes = [
    { path: '', component: HomeComponent,

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
    }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientsRoutingModule { 


}
