import { DoctorRegistrationComponent } from './doctor-registration/doctor-registration.component';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { environment } from './../environments/environment';
import { MaterialModule } from './material/material.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { FlexLayoutModule } from "@angular/flex-layout"
import { AngularFireModule } from '@angular/fire';
import { LoadingDialogComponent } from './loading-dialog/loading-dialog.component';
import {NgxImageCompressService} from 'ngx-image-compress';
import { LoadingSplashComponent } from './loading-splash/loading-splash.component';
import { AgmCoreModule } from '@agm/core';
import { ImageCropperModule } from 'ngx-image-cropper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import { LoginComponent } from './login/login.component';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';
import { AuthActionComponent } from './auth-action/auth-action.component';
import { CreateAccountBottomSheetComponent } from './create-account-bottom-sheet/create-account-bottom-sheet.component';
import { PatientRegistrationComponent } from './patient-registration/patient-registration.component'; 
import { HttpClientModule } from '@angular/common/http';
import { MediaAlertDialogComponent } from './media-alert-dialog/media-alert-dialog.component';
import { PrescriptionDialogComponent } from './prescription-dialog/prescription-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    LoadingDialogComponent,
    LoadingSplashComponent,
    DoctorRegistrationComponent,
    LoginComponent,
    MessageDialogComponent,
    AuthActionComponent,
    CreateAccountBottomSheetComponent,
    PatientRegistrationComponent,
    MediaAlertDialogComponent,
    PrescriptionDialogComponent
  ],
  imports: [
    FlexLayoutModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    ImageCropperModule,
    RouterModule,
    GooglePlaceModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBlMTpGtvjymyxqra7NDzMxAmOOopxGP3I'
    }),
    AngularFireModule.initializeApp(environment.firebase),
    MaterialModule,
    HttpClientModule
  ],
  providers: [
    AuthService,
    NgxImageCompressService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
