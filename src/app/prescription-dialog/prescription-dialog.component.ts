import { UtilsService } from './../services/utils.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { DoctorUserData } from './../models/doctor-user-data';

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import  jspdf from 'jspdf';  
import html2canvas from 'html2canvas'; 
import { Prescription } from '../models/prescription';

@Component({
  selector: 'app-prescription-dialog',
  templateUrl: './prescription-dialog.component.html',
  styleUrls: ['./prescription-dialog.component.scss']
})
export class PrescriptionDialogComponent implements OnInit {

  public editModeActive: boolean = false;
  public prescriptionText: string = "";
  public prescription: Prescription;
  public isDoctor: boolean;

  constructor(public dialogRef: MatDialogRef<PrescriptionDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
    private firestore: FirestoreService, public util:UtilsService
  ) {
      
      this.prescription = data.prescription as Prescription;
      this.isDoctor = data.isDoctor as boolean;
    }

  ngOnInit(): void {
  }

  public captureScreen()  
  {  
    var data = document.getElementById('parent');  //Id of the table
    //https://therichpost.com/how-to-convert-html-into-pdf-in-angular-10/
    html2canvas(data).then(canvas => {  
      // Few necessary setting options  
      let imgWidth = 208;   
      let pageHeight = 295;    
      let imgHeight = canvas.height * imgWidth / canvas.width;  
      let heightLeft = imgHeight;  

      const contentDataURL = canvas.toDataURL('image/png')  
      let pdf = new jspdf('p', 'mm', 'a4',false); // A4 size page of PDF  
      let position = 0;  
      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight)  
      pdf.save('prescription.pdf'); // Generated PDF   
    });  
  }
  
  printDiv() {

    // var printContents = document.getElementById('parent').innerHTML;
    
    // var originalContents = document.body.innerHTML;

    // document.body.innerHTML = printContents;

    
    // window.print();

    // document.body.innerHTML = originalContents;

    const printContent = document.getElementById("parent");
    const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
    WindowPrt.document.write(printContent.innerHTML);

    WindowPrt.document.close();
    WindowPrt.focus();
    WindowPrt.print();
   // WindowPrt.close();
  }
  
  public sendprescription() {

    if (this.editModeActive) {

      this.editModeActive = false;
      return;
    }
    this.dialogRef.close({ approved: false });
    
    console.log("Prescription sent!");
    
  }

  public getDateString():string{
    return new Date().toLocaleDateString();
  } 

  public millisToDateString(milliseconds:number):string{
    return new Date(milliseconds).toLocaleDateString();
  }

  public sendPrrscription() {

    if (this.editModeActive) {

      this.editModeActive = false;
      return;
    }
    

    this.util.showLoading("Sending Priscription...")
    let collectionPath: string = "user-data-patient/" + this.prescription.getPatientId() + "/prescriptions";

    console.log();
    
    this.firestore.save(collectionPath, this.prescription.getWrittenTime().toString(), Object.assign({}, this.prescription))
      .then(() => {
        this.util.hideLoading();
        this.util.showMsgSnakebar("Prescription sent!");
        this.dialogRef.close({ approved: false });
      })
      .catch(error => {
        this.util.hideLoading();
        console.log("error in sending priscription.");
        this.util.showMsgSnakebar("Error occured while sending prescription, please try again");
        this.dialogRef.close({ approved: false });
        
      });
    // user-data-patient


  }

}
