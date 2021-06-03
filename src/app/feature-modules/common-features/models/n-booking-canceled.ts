
export class BookingCancledNotification{

    private patientName: string;
    private queueId: string;
    private queuePlace: number;
    private requestHandled: boolean;
    private read: boolean;
    private notificationId: string;
    private notificationType: string;

    constructor(){}

    public getPatientName(): string {
        return this.patientName;
    }

    public setPatientName(patientName: string): void {
        this.patientName = patientName;
    }

    public getQueueId(): string {
        return this.queueId;
    }

    public setQueueId(queueId: string): void {
        this.queueId = queueId;
    }

    public getQueuePlace(): number {
        return this.queuePlace;
    }

    public setQueuePlace(queuePlace: number): void {
        this.queuePlace = queuePlace;
    }

    public isRequestHandled(): boolean {
        return this.requestHandled;
    }

    public setRequestHandled(requestHandled: boolean): void {
        this.requestHandled = requestHandled;
    }

    public isRead(): boolean {
        return this.read;
    }

    public setRead(read: boolean): void {
        this.read = read;
    }

    public getNotificationId(): string {
        return this.notificationId;
    }

    public setNotificationId(notificationId: string): void {
        this.notificationId = notificationId;
    }

    public getNotificationType(): string {
        return this.notificationType;
    }

    public setNotificationType(notificationType: string): void {
        this.notificationType = notificationType;
    }

}