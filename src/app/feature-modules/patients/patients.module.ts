import { NgModule } from '@angular/core';
import { PatientsRoutingModule } from './patients-routing.module';
import { ProfileComponent } from './profile/profile.component';
import { MainNavigationComponent } from './main-navigation/main-navigation.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MeetingsComponent } from './meetings/meetings.component';
import { MeetupLobbyComponent } from './meetup-lobby/meetup-lobby.component';
import { BookingDialogComponent } from './booking-dialog/booking-dialog.component';
import { IncomingCallBottomSheetComponent } from './incoming-call-bottom-sheet/incoming-call-bottom-sheet.component';
import { ConferenceComponent } from './conference/conference.component';
import { BaseComponent } from './base/base.component';
import { PatientFirestoreService } from './service/patient-firestore.service';
import { BookingRescheduleSelectorComponent } from './booking-reschedule-selector/booking-reschedule-selector.component';
import { CancelMeetingAlertComponent } from './cancel-meeting-alert/cancel-meeting-alert.component';
import { RequestRefundComponent } from './request-refund/request-refund.component';
import { CalculationService } from './service/calculation.service';
import { CommonFeaturesModule } from '../common-features/common-features.module';

@NgModule({
  declarations: [
    ProfileComponent,
    MainNavigationComponent,
    DashboardComponent,
    MeetingsComponent,
    MeetupLobbyComponent,
    BookingDialogComponent,
    IncomingCallBottomSheetComponent,
    ConferenceComponent,
    BaseComponent,
    BookingRescheduleSelectorComponent,
    CancelMeetingAlertComponent,
    RequestRefundComponent
  ],
  imports: [
    PatientsRoutingModule,
    CommonFeaturesModule
  ],
  providers: [PatientFirestoreService, CalculationService],
  bootstrap: [BaseComponent]

})

export class PatientsModule { }
