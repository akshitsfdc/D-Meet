import { ConferenceComponent } from './conference/conference.component';

import { EditQueueComponent } from './edit-queue/edit-queue.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateQueueComponent } from './create-queue/create-queue.component';
import { DoctorConferenceComponent } from './doctor-conference/doctor-conference.component';
import { DoctorProfileComponent } from './doctor-profile/doctor-profile.component';
import { HomeComponent } from './home/home.component';
import { LiveQueueDetailsComponent } from './live-queue-details/live-queue-details.component';
import { LiveQueueComponent } from './live-queue/live-queue.component';
import { QueuesComponent } from './queues/queues.component';
import { MeetupLobbyComponent } from './meetup-lobby/meetup-lobby.component';


const routes: Routes = [

    
   
    
    {
      path: '', component: HomeComponent,

      children: [
        {path: 'doctor-profile', component: DoctorProfileComponent},
        {
          path: 'home', component: LiveQueueComponent
        },
        { path: 'queues', component: QueuesComponent },
        {
          path: 'meetup-lobby', component: MeetupLobbyComponent
        },
        {path: 'queues/createQueue', component: CreateQueueComponent},
        {path: 'queues/editQueue', component: EditQueueComponent},
        { path: 'home/queue', component: LiveQueueDetailsComponent },
        { path: 'liveQueue/queueDetails/patientMeet', component: DoctorConferenceComponent }
      ]


  },
  {
    path: 'conference', component: ConferenceComponent,
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorRoutingModule { }
