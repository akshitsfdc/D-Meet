import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
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



@NgModule({
  declarations: [
    HomeComponent,
    ProfileComponent,
    MainNavigationComponent,
    DashboardComponent,
    MeetingsComponent,
    MeetupLobbyComponent
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
  bootstrap: [HomeComponent]
})

export class PatientsModule { }
