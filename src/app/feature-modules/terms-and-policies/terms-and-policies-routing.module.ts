import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PricingAndBookingPolicyComponent } from "./pricing-and-booking-policy/pricing-and-booking-policy.component";
import { PrivacyPolicyComponent } from "./privacy-policy/privacy-policy.component";
import { RefunAndCancellationPolicyComponent } from "./refun-and-cancellation-policy/refun-and-cancellation-policy.component";
import { TermsAndConditionComponent } from "./terms-and-condition/terms-and-condition";
import { TermsComponent } from "./terms/terms.component";

const routes: Routes = [

  {
    path: '', component: TermsComponent,
    children: [
      { path: 'privacy-policy', component: PrivacyPolicyComponent },
      { path: 'terms-and-condition', component: TermsAndConditionComponent },
      { path: 'pricing-and-booking-policy', component: PricingAndBookingPolicyComponent },
      { path: 'refund-and-cancellation-policy', component: RefunAndCancellationPolicyComponent }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TermsAndConditionRoutingModule {


}
