import { HttpService } from './../../../services/http.service';
import { Injectable } from '@angular/core';

@Injectable()
export class CheckoutService {

  constructor(private httpService: HttpService) { }


  public getPaymentOptionObject(): any {

    const options = {
      key: 'rzp_test_SnRK7eLaxyvCKn', // Enter the Key ID generated from the Dashboard
      amount: '', // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency: '',
      name: '',
      description: '',
      image: '',
      order_id: '', // This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      // "handler": function (response){
      //     alert(response.razorpay_payment_id);
      //     alert(response.razorpay_order_id);
      //     alert(response.razorpay_signature)
      // },
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      notes: {
        address: ''
      },
      theme: {
        color: ''
      }
    };

    return options;
  }

  public createOrderId(amount: string, currency: string): Promise<any> {
    return this.httpService.getDataForPayment('getOrderId', amount, currency);
  }
}
