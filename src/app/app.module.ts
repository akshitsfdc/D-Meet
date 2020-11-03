import { CreateQueueComponent } from './create-queue/create-queue.component';
import { HomeComponent } from './home/home.component';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { environment } from './../environments/environment';
import { MaterialModule } from './material/material.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Component } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DoctorAddressSegComponent } from './doctor-address-seg/doctor-address-seg.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MainNavigationComponent } from './main-navigation/main-navigation.component';
import { LayoutModule } from '@angular/cdk/layout';
import { DoctorTableComponent } from './doctor-table/doctor-table.component';
import { MainDashboardComponent } from './main-dashboard/main-dashboard.component';
import { MainTreeComponent } from './main-tree/main-tree.component';

import { MainDragDropComponent } from './main-drag-drop/main-drag-drop.component';

import { LandingPageComponent } from './landing-page/landing-page.component';

import { FlexLayoutModule } from "@angular/flex-layout"

import { AngularFireModule } from '@angular/fire';
import { LiveQueueComponent } from './live-queue/live-queue.component';
import { LiveQueueDetailsComponent } from './live-queue-details/live-queue-details.component';
import { DoctorConferenceComponent } from './doctor-conference/doctor-conference.component';
import { MovePatientComponent } from './move-patient/move-patient.component';
import { QueuesComponent } from './queues/queues.component';
import { DoctorRegistrationComponent } from './doctor-registration/doctor-registration.component';
import { LoadingDialogComponent } from './loading-dialog/loading-dialog.component';
import { BankKycFormComponent } from './bank-kyc-form/bank-kyc-form.component';
import {NgxImageCompressService} from 'ngx-image-compress';
import { LoadingSplashComponent } from './loading-splash/loading-splash.component';
import { TestNavigationComponent } from './test-navigation/test-navigation.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { DoctorProfileComponent } from './doctor-profile/doctor-profile.component';
import { AgmCoreModule } from '@agm/core';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { ImageCropperModule } from 'ngx-image-cropper';


@NgModule({
  declarations: [
    AppComponent,
    DoctorAddressSegComponent,
    MainNavigationComponent,
    DoctorTableComponent,
    MainDashboardComponent,
    MainTreeComponent,
    MainDragDropComponent,
    LandingPageComponent,
    HomeComponent,
    LiveQueueComponent,
    LiveQueueDetailsComponent,
    DoctorConferenceComponent,
    MovePatientComponent,
    QueuesComponent,
    CreateQueueComponent,
    DoctorRegistrationComponent,
    LoadingDialogComponent,
    BankKycFormComponent,
    LoadingSplashComponent,
    TestNavigationComponent,
    DoctorProfileComponent,
    ProfileEditComponent
  ],
  imports: [
    FlexLayoutModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    LayoutModule,
    ImageCropperModule,
    RouterModule.forChild([
      { path: '', component: LoadingSplashComponent },
      { path: 'login', component: LandingPageComponent },
      { path: 'doctorregistration', component: DoctorRegistrationComponent }, 
      {
        path: 'home', component: HomeComponent,

        children: [
          {path: 'doctor-profile', component: DoctorProfileComponent},
          {
            path: 'liveQueue', component: LiveQueueComponent
          },
          {path: 'queues', component: QueuesComponent},
          {path: 'queues/createQueue', component: CreateQueueComponent},
          { path: 'liveQueue/queueDetails', component: LiveQueueDetailsComponent },
          { path: 'liveQueue/queueDetails/patientMeet', component: DoctorConferenceComponent }
        ]
      }
      

    ]),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBlMTpGtvjymyxqra7NDzMxAmOOopxGP3I'
    }),
    AngularFireModule.initializeApp(environment.firebase),
   
    MaterialModule,
   
    MatToolbarModule,
   
    MatButtonModule,
   
    MatSidenavModule,
   
    MatIconModule,
   
    MatListModule
  ],
  providers: [
    AuthService,
    NgxImageCompressService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
