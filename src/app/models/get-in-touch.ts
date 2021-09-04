

export class GetInTouch {

    private name!: string;
    private phone!: string;
    private email!: string;
    private request!: string;
    private status!: string;

    constructor() { }


    public getStatus(): string {
        return this.status!;
    }

    public setStatus(status: string): void {
        this.status! = status!;
    }
    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getPhone(): string {
        return this.phone;
    }

    public setPhone(phone: string): void {
        this.phone = phone;
    }

    public getEmail(): string {
        return this.email;
    }

    public setEmail(email: string): void {
        this.email = email;
    }

    public getRequest(): string {
        return this.request;
    }

    public setRequest(request: string): void {
        this.request = request;
    }


}