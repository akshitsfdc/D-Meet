import { SessionService } from './services/session.service';
import { QueuesComponent } from './queues/queues.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { MovePatientComponent } from './move-patient/move-patient.component';
import { MainNavigationComponent } from './main-navigation/main-navigation.component';
import { LiveQueueDetailsComponent } from './live-queue-details/live-queue-details.component';
import { LiveQueueComponent } from './live-queue/live-queue.component';
import { DoctorProfileComponent } from './doctor-profile/doctor-profile.component';
import { DoctorConferenceComponent } from './doctor-conference/doctor-conference.component';
import { CreateQueueComponent } from './create-queue/create-queue.component';
import { BankKycFormComponent } from './bank-kyc-form/bank-kyc-form.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorRoutingModule } from './doctor-routing.module';
import { HomeComponent } from './home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material/material.module';
import { AgmCoreModule } from '@agm/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { EditQueueComponent } from './edit-queue/edit-queue.component';
import { MeetupLobbyComponent } from './meetup-lobby/meetup-lobby.component';

@NgModule({
  declarations: [
    BankKycFormComponent,
    CreateQueueComponent,
    DoctorConferenceComponent,
    DoctorProfileComponent,
    HomeComponent,
    LiveQueueComponent,
    LiveQueueDetailsComponent,
    MainNavigationComponent,
    MovePatientComponent,
    ProfileEditComponent,
    QueuesComponent,
    EditQueueComponent,
    MeetupLobbyComponent
  ],
  imports: [
    FlexLayoutModule,
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    DoctorRoutingModule,
    MaterialModule,
    AgmCoreModule,
    NgxMaterialTimepickerModule.setLocale('en-US')
  ],
  exports: [],
  providers:[SessionService],
  bootstrap:[HomeComponent]
})
export class DoctorModule { }
