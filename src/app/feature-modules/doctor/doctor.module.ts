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
    QueuesComponent
  ],
  imports: [
    FlexLayoutModule,
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    DoctorRoutingModule,
    MaterialModule,
    AgmCoreModule
  ],
  exports: [],
  bootstrap:[HomeComponent]
})
export class DoctorModule { }
