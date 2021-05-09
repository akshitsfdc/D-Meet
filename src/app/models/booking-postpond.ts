

export class BookingPostpond{

    private requested: boolean;
    private handled: boolean;
    private approved: boolean;
    private rejected: boolean;
    private requestedAt: number;
    private processedAt: number;
    private rescheduleDate: number;
    private requestReason: string;
    private rejectReason: string;

   constructor(){}

    
     public getProcessedAt(): number {
        return this.processedAt;
    }

    public setProcessedAt(processedAt: number): void {
        this.processedAt = processedAt;
    }

    public isRejected(): boolean {
        return this.rejected;
    }

    public setRejected(rejected: boolean): void {
        this.rejected = rejected;
    }
   public isHandled(): boolean {
        return this.handled;
   }

    public setHandled(handled: boolean): void {
        this.handled = handled;
    }
    
    public getRequestReason(): string {
        return this.requestReason;
    }

    public setRequestReason(requestReason: string): void {
        this.requestReason = requestReason;
    }

    public getRejectReason(): string {
        return this.rejectReason;
    }

    public setRejectReason(rejectReason: string): void {
        this.rejectReason = rejectReason;
    }

    public isRequested(): boolean {
        return this.requested;
    }

    public setRequested(requested: boolean): void {
        this.requested = requested;
    }

    public isApproved(): boolean {
        return this.approved;
    }

    public setApproved(approved: boolean): void {
        this.approved = approved;
    }

    public getRequestedAt(): number {
        return this.requestedAt;
    }

    public setRequestedAt(requestedAt: number): void {
        this.requestedAt = requestedAt;
    }

    public getRescheduleDate(): number {
        return this.rescheduleDate;
    }

    public setRescheduleDate(rescheduleDate: number): void {
        this.rescheduleDate = rescheduleDate;
    }




}