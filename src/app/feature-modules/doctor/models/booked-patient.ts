

export class BookedPatient {

    private _name: string;
    private _picUrl: string;
    private _from: string;
    private _status: string;
    private _condition: string;
    private _queuePlace: number;
    private _waitingTime: string;
    private _bookingId: string;

    constructor(){}


    public get name() {
        return this._name;
    }
    public set name(name: string) {
        this._name = name;
    }

    public get picUrl() {
        return this._picUrl;
    }
    public set picUrl(picUrl: string) {
        this._picUrl = picUrl;
    }

    public get from() {
        return this._from;
    }
    public set from(from: string) {
        this._from = from;
    }

    public get status() {
        return this._status;
    }
    public set status(status: string) {
        this._status = status;
    }

    public get condition() {
        return this._condition;
    }
    public set condition(condition: string) {
        this._condition = condition;
    }

    public get queuePlace() {
        return this._queuePlace;
    }
    public set queuePlace(queuePlace: number) {
        this._queuePlace = queuePlace;
    }

    public get waitingTime() {
        return this._waitingTime;
    }
    public set waitingTime(waitingTime: string) {
        this._waitingTime = waitingTime;
    }

    public get bookingId() {
        return this._bookingId;
    }
    public set bookingId(bookingId: string) {
        this._bookingId = bookingId;
    }

}
