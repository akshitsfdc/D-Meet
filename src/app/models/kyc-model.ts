
export class KYCModel {


    private ifscCode:string;
    private accountNumber:string;
    private beneficiary:string;
    private accountType:string;
    private kycDocumentUrl:string;
    private kycDoccumentType:string;
    private userId:string;

    constructor(){

    }

    public getAccountType(): string {
        return this.accountType;
    }

    public setAccountType(accountType: string): void {
        this.accountType = accountType;
    }
    
    public getKycDoccumentType(): string {
        return this.kycDoccumentType;
    }

    public setKycDoccumentType(kycDoccumentType: string): void {
        this.kycDoccumentType = kycDoccumentType;
    }
    
    public getUserId(): string {
        return this.userId;
    }

    public setUserId(userId: string): void {
        this.userId = userId;
    }

    public getIfscCode(): string {
        return this.ifscCode;
    }

    public setIfscCode(ifscCode: string): void {
        this.ifscCode = ifscCode;
    }

    public getAccountNumber(): string {
        return this.accountNumber;
    }

    public setAccountNumber(accountNumber: string): void {
        this.accountNumber = accountNumber;
    }

    public getBeneficiary(): string {
        return this.beneficiary;
    }

    public setBeneficiary(beneficiary: string): void {
        this.beneficiary = beneficiary;
    }

    public getKycDocumentUrl(): string {
        return this.kycDocumentUrl;
    }

    public setKycDocumentUrl(kycDocumentUrl: string): void {
        this.kycDocumentUrl = kycDocumentUrl;
    }



}