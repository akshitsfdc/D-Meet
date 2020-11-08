import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { PatientsRoutingModule } from './patients-routing.module';



@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    PatientsRoutingModule
  ],
  bootstrap: [HomeComponent]
})

export class PatientsModule { }
