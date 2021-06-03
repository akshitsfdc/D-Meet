import { CommonFeaturesModule } from './../common-features/common-features.module';
import { DoctorFirestoreService } from './services/doctor-firestore.service';
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
import { DoctorRoutingModule } from './doctor-routing.module';
import { EditQueueComponent } from './edit-queue/edit-queue.component';
import { MeetupLobbyComponent } from './meetup-lobby/meetup-lobby.component';
import { ConferenceComponent } from './conference/conference.component';
import { BaseComponent } from './base/base.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

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
    DoctorRoutingModule,
    CommonFeaturesModule,
    NgxMaterialTimepickerModule.setLocale('en-US')
  ],
  providers: [DoctorFirestoreService],
  bootstrap: [BaseComponent]
})
export class DoctorModule { }
