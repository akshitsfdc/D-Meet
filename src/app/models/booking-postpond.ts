

class BookingPostpond{

    private requested: boolean;
    private approved: boolean;
    private requestedAt: number;
    private approvedAt: number;
    private rescheduleDate: number;
    private requestReason: string;
    private rejectReason: string;

   constructor(){}

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

    public getApprovedAt(): number {
        return this.approvedAt;
    }

    public setApprovedAt(approvedAt: number): void {
        this.approvedAt = approvedAt;
    }

    public getRescheduleDate(): number {
        return this.rescheduleDate;
    }

    public setRescheduleDate(rescheduleDate: number): void {
        this.rescheduleDate = rescheduleDate;
    }




}