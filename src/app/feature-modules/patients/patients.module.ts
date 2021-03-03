import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientsRoutingModule } from './patients-routing.module';
import { ProfileComponent } from './profile/profile.component';
import { MainNavigationComponent } from './main-navigation/main-navigation.component';
import { MaterialModule } from './material/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgmCoreModule } from '@agm/core';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MeetingsComponent } from './meetings/meetings.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MeetupLobbyComponent } from './meetup-lobby/meetup-lobby.component';
import { BookingDialogComponent } from './booking-dialog/booking-dialog.component';
import { IncomingCallBottomSheetComponent } from './incoming-call-bottom-sheet/incoming-call-bottom-sheet.component';
import { ConferenceComponent } from './conference/conference.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BaseComponent } from './base/base.component';



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
    BaseComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule, 
    ReactiveFormsModule,
    AgmCoreModule,
    PatientsRoutingModule,
    MaterialModule,
    InfiniteScrollModule
  ],
  bootstrap: [BaseComponent]

})

export class PatientsModule { }
