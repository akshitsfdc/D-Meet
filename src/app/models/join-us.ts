

export class JoinUs {

    private name!: string;
    private phone!: string;
    private email!: string;
    private downloadUrl: any;
    private status!: string;

    constructor() { }

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

    public getDownloadUrl(): any {
        return this.downloadUrl;
    }

    public setDownloadUrl(downloadUrl: any): void {
        this.downloadUrl = downloadUrl;
    }

    public getStatus(): string {
        return this.status;
    }

    public setStatus(status: string): void {
        this.status = status;
    }



}