import { DoctorModule } from './feature-modules/doctor/doctor.module';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PatientsModule } from './feature-modules/patients/patients.module';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoadingSplashComponent } from './loading-splash/loading-splash.component';
import { DoctorRegistrationComponent } from './doctor-registration/doctor-registration.component';


const routes: Routes = [

  { path: '', component: LoadingSplashComponent },
  { path: 'login', component: LandingPageComponent },
  { path: 'registration', component: DoctorRegistrationComponent },
  { path: 'doctorregistration', component: DoctorRegistrationComponent }, 
  {
    path: 'patient',
    loadChildren: () => PatientsModule
  },
  {
    path: 'doctor',
    loadChildren: () => DoctorModule
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 


}
