
export class PaymentInfo {

    private paymentId: string;
    private orderId: string;
    private signature: string;

    constructor() {
        
    }

    public getPaymentId(): string {
        return this.paymentId;
    }

    public setPaymentId(paymentId: string): void {
        this.paymentId = paymentId;
    }

    public getOrderId(): string {
        return this.orderId;
    }

    public setOrderId(orderId: string): void {
        this.orderId = orderId;
    }

    public getSignature(): string {
        return this.signature;
    }

    public setSignature(signature: string): void {
        this.signature = signature;
    }


}