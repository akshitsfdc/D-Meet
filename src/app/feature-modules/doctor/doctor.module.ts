import { DoctorHelperService } from './services/doctor-helper.service';

import { CommonFeaturesModule } from './../common-features/common-features.module';
import { DoctorFirestoreService } from './services/doctor-firestore.service';
import { QueuesComponent } from './queues/queues.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { MovePatientComponent } from './move-patient/move-patient.component';
import { MainNavigationComponent } from './main-navigation/main-navigation.component';
import { LiveQueueDetailsComponent } from './live-queue-details/live-queue-details.component';
import { DoctorProfileComponent } from './doctor-profile/doctor-profile.component';
import { CreateQueueComponent } from './create-queue/create-queue.component';
import { BankKycFormComponent } from './bank-kyc-form/bank-kyc-form.component';
import { NgModule } from '@angular/core';
import { DoctorRoutingModule } from './doctor-routing.module';
import { EditQueueComponent } from './edit-queue/edit-queue.component';
import { MeetupLobbyComponent } from './meetup-lobby/meetup-lobby.component';
import { ConferenceComponent } from './conference/conference.component';
import { BaseComponent } from './base/base.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { SessionService } from './services/session.service';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [
    BankKycFormComponent,
    CreateQueueComponent,
    DoctorProfileComponent,
    DashboardComponent,
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
    DoctorRoutingModule,
    CommonFeaturesModule,
    NgxMaterialTimepickerModule.setLocale('en-US')
  ],
  providers: [DoctorFirestoreService, SessionService, DoctorHelperService],
  bootstrap: [BaseComponent]
})
export class DoctorModule { }
