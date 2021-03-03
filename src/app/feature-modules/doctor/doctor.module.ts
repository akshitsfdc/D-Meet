import { QueuesComponent } from './queues/queues.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { MovePatientComponent } from './move-patient/move-patient.component';
import { MainNavigationComponent } from './main-navigation/main-navigation.component';
import { LiveQueueDetailsComponent } from './live-queue-details/live-queue-details.component';
import { LiveQueueComponent } from './live-queue/live-queue.component';
import { DoctorProfileComponent } from './doctor-profile/doctor-profile.component';
import { CreateQueueComponent } from './create-queue/create-queue.component';
import { BankKycFormComponent } from './bank-kyc-form/bank-kyc-form.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorRoutingModule } from './doctor-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material/material.module';
import { AgmCoreModule } from '@agm/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { EditQueueComponent } from './edit-queue/edit-queue.component';
import { MeetupLobbyComponent } from './meetup-lobby/meetup-lobby.component';
import { ConferenceComponent } from './conference/conference.component';
import { BaseComponent } from './base/base.component';

@NgModule({
  declarations: [
    BankKycFormComponent,
    CreateQueueComponent,
    DoctorProfileComponent,
    LiveQueueComponent,
    LiveQueueDetailsComponent,
    MainNavigationComponent,
    MovePatientComponent,
    ProfileEditComponent,
    QueuesComponent,
    EditQueueComponent,
    MeetupLobbyComponent,
    ConferenceComponent,
    BaseComponent
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
  
  bootstrap:[BaseComponent]
})
export class DoctorModule { }
