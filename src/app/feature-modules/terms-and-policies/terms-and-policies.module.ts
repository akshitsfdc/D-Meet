
import { CommonFeaturesModule } from './../common-features/common-features.module';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TermsAndConditionRoutingModule } from './terms-and-policies-routing.module';
import { MaterialModule } from 'src/app/material/material.module';
import { RefunAndCancellationPolicyComponent } from './refun-and-cancellation-policy/refun-and-cancellation-policy.component';
import { TermsAndConditionComponent } from './terms-and-condition/terms-and-condition';
import { PricingAndBookingPolicyComponent } from './pricing-and-booking-policy/pricing-and-booking-policy.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsComponent } from './terms/terms.component';



@NgModule({
  declarations: [
    PricingAndBookingPolicyComponent,
    PrivacyPolicyComponent,
    RefunAndCancellationPolicyComponent,
    TermsComponent,
    TermsAndConditionComponent
  ],
  imports: [
    CommonModule,
    CommonFeaturesModule,
    TermsAndConditionRoutingModule,
    MaterialModule
  ],
  bootstrap: [TermsComponent]
})
export class TermsAndPoliciesModule { }
