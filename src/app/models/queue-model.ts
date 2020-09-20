

export class QueueModel {

    private _fees: number;
    private _status: string;
    private _patientLimit: number;
    private _bookingStarting: string;
    private _consultingStarting: string;
    private _bookedPatients: number;
    private _queueId: string;
    private _ownerId: string;

    constructor(){}


    public get fees() {
        return this._fees;
    }
    public set fees(fees: number) {
        this._fees = fees;
    }

    public get patientLimit() {
        return this._patientLimit;
    }
    public set patientLimit(patientLimit: number) {
        this._patientLimit = patientLimit;
    }

    public get status() {
        return this._status;
    }
    public set status(status: string) {
        this._status = status;
    }

    public get bookingStarting() {
        return this._bookingStarting;
    }
    public set bookingStarting(bookingStarting: string) {
        this._bookingStarting = bookingStarting;
    }

    public get consultingStarting() {
        return this._consultingStarting;
    }
    public set consultingStarting(consultingStarting: string) {
        this._consultingStarting = consultingStarting;
    }

    public get bookedPatients() {
        return this._bookedPatients;
    }
    public set bookedPatients(bookedPatients: number) {
        this._bookedPatients = bookedPatients;
    }

    public get queueId() {
        return this._queueId;
    }
    public set queueId(queueId: string) {
        this._queueId = queueId;
    }

    public get ownerId() {
        return this._ownerId;
    }
    public set ownerId(ownerId: string) {
        this._ownerId = ownerId;
    }

}
