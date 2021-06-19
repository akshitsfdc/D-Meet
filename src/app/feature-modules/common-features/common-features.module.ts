
import { MaterialModule } from './../material/material.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgmCoreModule } from '@agm/core';
import { ImgFallbackModule } from 'ngx-img-fallback';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { HelperService } from './services/helper.service';
import { CalculationService } from './services/calculation.service';
import { ManagementService } from './services/management.service';


@NgModule({
  declarations: [],
  imports: [

  ],
  exports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    AgmCoreModule,
    ImgFallbackModule,
    MaterialModule,
    InfiniteScrollModule
  ],
  providers: [HelperService, CalculationService, ManagementService]
})
export class CommonFeaturesModule { }
