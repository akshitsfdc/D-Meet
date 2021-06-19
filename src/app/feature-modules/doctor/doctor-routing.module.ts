import { ConferenceComponent } from './conference/conference.component';
import { EditQueueComponent } from './edit-queue/edit-queue.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateQueueComponent } from './create-queue/create-queue.component';
import { DoctorProfileComponent } from './doctor-profile/doctor-profile.component';
import { LiveQueueDetailsComponent } from './live-queue-details/live-queue-details.component';
import { QueuesComponent } from './queues/queues.component';
import { MeetupLobbyComponent } from './meetup-lobby/meetup-lobby.component';
import { MainNavigationComponent } from './main-navigation/main-navigation.component';
import { DashboardComponent } from './dashboard/dashboard.component';


const routes: Routes = [

  {
    path: '', component: MainNavigationComponent,
    // children: [
    //   {
    // path: '', component: MainNavigationComponent,

    children: [

      { path: 'doctor-profile', component: DoctorProfileComponent },
      {
        path: 'dashboard', component: DashboardComponent
      },
      { path: 'queues', component: QueuesComponent },
      {
        path: 'meetup-lobby', component: MeetupLobbyComponent
      },
      { path: 'queues/createQueue', component: CreateQueueComponent },
      { path: 'queues/editQueue', component: EditQueueComponent },
      { path: 'home/queue', component: LiveQueueDetailsComponent }
    ]


    // },
    ,
    // {
    //   }
    // ]

  },
  { path: 'conference', component: ConferenceComponent }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorRoutingModule { }
