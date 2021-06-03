import { AngularFireUploadTask } from '@angular/fire/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, Inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { FirestoreService } from 'src/app/services/firestore.service';
import { StorageService } from 'src/app/services/storage.service';
import { DoctorUserData } from '../../common-features/models/doctor-user-data';


export interface DialogData {
  type: string
  userData: DoctorUserData
}
export interface Position {
  latitude: number
  longitude: number
}
@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.css']
})
export class ProfileEditComponent implements OnInit {


  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  imageChangedEvent: any = '';
  croppedImage: Blob = null;

  activePPForm: boolean = false;
  activeAboutForm: boolean = false;
  activeFacilityForm: boolean = false;
  activeDiseaseForm: boolean = false;
  activeBankForm: boolean = false;
  activeProfilePicChange: boolean = false;
  disableUploadButton: boolean = false;


  profilePicUrl: string;
  uploadPercentage: number = 0;

  countries = ["India"];
  specialists = [];
  degrees = [];

  dialogResponse = { canceled: true };

  ppForm: FormGroup;
  aboutForm: FormGroup;
  facilityForm: FormGroup;
  diseasesForm: FormGroup;
  bankForm: FormGroup;

  states = [];
  cities = [];
  desease: string[] = [];

  filteredOptionsCountry: Observable<string[]>;
  filteredOptionsState: Observable<string[]>;
  filteredOptionsCity: Observable<string[]>;
  filteredOptionsSpeciality: Observable<string[]>;
  filteredOptionsDegree: Observable<string[]>;

  constructor(private firestore: FirestoreService, public dialogRef: MatDialogRef<ProfileEditComponent>, private storage: StorageService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit(): void {

    switch (this.data.type) {
      case "pp": {
        this.initPPFprm();
        break;
      }
      case "about": {
        this.initAboutForm();
        break;
      }
      case "facility": {
        this.initFacilityForm();
        break;
      }
      case "disease": {
        this.initDiseaseSpe();
        break;
      }
      case "bank": {
        this.initBankDetails();
        break;
      }
      case "profilePicChange": {
        this.initProfilePictureChange();
        break;
      }
    }

  }


  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {

    this.setImageBlob(event.base64);
  }
  private async setImageBlob(base64Url: string) {

    await fetch(base64Url)

      .then(res => {
        res.blob()
          .then(blob => {
            console.log("blob :" + JSON.stringify(blob));
            this.croppedImage = blob;
          })
          .catch(error => {
            console.error(error);
          })


      })
      .catch(error => {
        console.error(error);
      })
  }
  imageLoaded() {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }

  uploadProfilePic() {
    if (this.croppedImage === null) {
      return;
    }
    const filePath = 'profilePictures/' + Date.now().toString() + "_" + this.data.userData.getUserId();

    let task: AngularFireUploadTask = this.storage.saveFileWithBlob(filePath, this.croppedImage);

    this.disableUploadButton = true;

    let perObs: Observable<number> = task.percentageChanges();
    perObs.subscribe(percent => {
      this.uploadPercentage = percent;
    });
    task.then(() => {
      this.storage.getURL(filePath).then(url => {

        console.log("Success! : " + url);
        this.profilePicUrl = url;

        this.updateProfilePicture();
        this.disableUploadButton = false;
      })
        .catch(err => {
          console.log("Error uploading file");
          this.disableUploadButton = false;
        });
    });
  }

  private initProfilePictureChange() {

    this.activeProfilePicChange = true;
    this.profilePicUrl = this.data.userData.getPicUrl();
  }
  private initBankDetails() {

    this.activeBankForm = true;
    this.bankForm = new FormGroup({
      ifsc: new FormControl('', [Validators.required]),
      accountNumber: new FormControl('', Validators.required),
      reAccountNumber: new FormControl('', [Validators.required]),
      beneficiaryName: new FormControl('', Validators.required),
      accountType: new FormControl('', Validators.required)
    });

  }
  private initDiseaseSpe() {

    this.activeDiseaseForm = true;
    this.diseasesForm = new FormGroup({});
    this.data.userData.getDiseaseSpecialist().forEach(element => {
      this.desease.push(element);
    });

  }
  private initFacilityForm() {

    this.activeFacilityForm = true;

    this.facilityForm = new FormGroup({
      clinicName: new FormControl(this.data.userData.getClinicName(), Validators.required),
      clinicAddress: new FormControl(this.data.userData.getFullClinicAddress(), Validators.required),
      country: new FormControl(this.data.userData.getCountry(), Validators.required),
      state: new FormControl(this.data.userData.getState(), Validators.required),
      city: new FormControl(this.data.userData.getCity(), Validators.required)
    });
    this.initCountries();
    // this.getStates(this.countries[0]);
  }
  private initAboutForm() {

    this.activeAboutForm = true;

    this.aboutForm = new FormGroup({
      about: new FormControl(this.data.userData.getAbout(), Validators.required)
    });

  }
  private initPPFprm() {

    this.activePPForm = true;

    this.ppForm = new FormGroup({
      // fullName: new FormControl(this.data.userData.getName(), Validators.required),
      speciality: new FormControl(this.data.userData.getSpeciality(), Validators.required),
      degree: new FormControl(this.data.userData.getDegree(), Validators.required),
      registrationNumber: new FormControl(this.data.userData.getRegistrationNumber(), Validators.required),
      experience: new FormControl(this.data.userData.getExperience(), Validators.required)
    });
    this.getDegrees("degree");
    this.getSpecializations("specialization");
  }
  addDesease(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      this.desease.push(value.toLocaleLowerCase().trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }
  removeDesease(key: string): void {
    const index = this.desease.indexOf(key);

    if (index >= 0) {
      this.desease.splice(index, 1);
    }
  }
  passwordChanged() {
    this.reAccountNumber.setErrors(null);
    const pass = ((this.accountNumber.value as string).trim()).toLowerCase();
    const rePass = ((this.reAccountNumber.value as string).trim()).toLowerCase();
    if (pass !== rePass) {
      this.reAccountNumber.setErrors({
        notEqalTo: true
      });
    }
  }
  private getDegrees(type: string) {

    this.firestore.getEquals('doctor-meta', 'type', type)
      .then(querySnapshots => {
        querySnapshots.forEach((doc) => {
          this.degrees = doc.data().degrees;
          console.log("this.states : " + this.degrees);
          this.initDegrees();
        });
      })
      .catch(error => {
        console.log("could not load degrees : " + error);
      });
  }
  private getSpecializations(type: string) {

    this.firestore.getEquals('doctor-meta', 'type', type)
      .then(querySnapshots => {
        querySnapshots.forEach((doc) => {
          this.specialists = doc.data().specializations;
          console.log("this.states : " + this.specialists);
          this.initSpeciality();
        });
      })
      .catch(error => {
        console.log("could not load degrees : " + error);
      });

  }

  private getStates(country: string) {

    this.firestore.getEquals('states', 'country', country)
      .then(querySnapshots => {
        querySnapshots.forEach((doc) => {
          this.states = doc.data().states;
          this.initStates();
        });
      })
      .catch(error => {
        console.log("could not load states : " + error);
      });

  }
  private getCities(country: string, state: string) {
    this.firestore.getEqualsDouble('cities', 'country', country, 'state', state)
      .then(querySnapshots => {
        querySnapshots.forEach((doc) => {
          this.cities = doc.data().cities;
          this.initCities();
        });

      })
      .catch(error => {
        console.log("could not load cities : " + error);
      });


  }


  private initDegrees(): void {
    this.filteredOptionsDegree = this.degree.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter_degrees(value))
      );
  }
  private initSpeciality(): void {
    this.filteredOptionsSpeciality = this.speciality.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter_specialities(value))
      );
  }
  private initCountries() {
    this.filteredOptionsCountry = this.country.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter_countries(value))
      );
  }
  private initStates(): void {
    this.filteredOptionsState = this.state.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter_states(value))
      );
  }
  private initCities(): void {
    this.filteredOptionsCity = this.city.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter_cities(value))
      );
  }
  private _filter_countries(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.countries.filter(option => option.toLowerCase().includes(filterValue));
  }
  private _filter_states(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.states.filter(option => option.toLowerCase().includes(filterValue));
  }
  private _filter_cities(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.cities.filter(option => option.toLowerCase().includes(filterValue));
  }
  private _filter_degrees(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.degrees.filter(option => option.toLowerCase().includes(filterValue));
  }
  private _filter_specialities(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.specialists.filter(option => option.toLowerCase().includes(filterValue));
  }

  onCountrySelected(selectedValue: string): void {
    this.state.patchValue('');
    this.states = [];
    this.getStates(selectedValue);
  }

  onStateSelected(selectedValue: string): void {
    this.city.patchValue('');
    this.cities = [];
    console.log("this.country.value.length " + this.country.value.length);
    if (this.country.value.length <= 0) {
      return;
    }
    this.getCities((this.country.value as string).toString().trim(), selectedValue);
  }
  onCitySelected(selectedValue: string): void {

  }
  get ifsc() {
    return this.bankForm.get('ifsc');
  }

  get accountNumber() {
    return this.bankForm.get('accountNumber');
  }
  get reAccountNumber() {
    return this.bankForm.get('reAccountNumber');
  }
  get beneficiaryName() {
    return this.bankForm.get('beneficiaryName');
  }
  get accountType() {
    return this.bankForm.get('accountType');
  }
  get fullName() {
    return this.ppForm.get('fullName');
  }

  get speciality() {
    return this.ppForm.get('speciality');
  }
  get degree() {
    return this.ppForm.get('degree');
  }
  get registrationNumber() {
    return this.ppForm.get('registrationNumber');
  }
  get experience() {
    return this.ppForm.get('experience');
  }
  get about() {
    return this.aboutForm.get('about');
  }
  get clinicName() {
    return this.facilityForm.get('clinicName');
  }
  get clinicAddress() {
    return this.facilityForm.get('clinicAddress');
  }
  get country() {
    return this.facilityForm.get('country');
  }
  get state() {
    return this.facilityForm.get('state');
  }
  get city() {
    return this.facilityForm.get('city');
  }
  onNoClick(): void {
    this.dialogRef.close(this.dialogResponse);
  }

  private updateDB(data: any) {

    this.dialogRef.close(this.dialogResponse);
    this.firestore.update("user-data", this.data.userData.getUserId(), data)
      .then(() => {
        console.log("updated!");
      })
      .catch(error => {
        console.log("error, could not update! " + error);
      });

  }

  private getGeoFromAddress(data: any) {

    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({
      'address': data.fullClinicAddress + " " + data.city + " " + data.state + " " + data.country
    }, (results, status) => {

      if (status == google.maps.GeocoderStatus.OK) {
        console.log("status : " + " result : " + results[0]);
        data['latitude'] = results[0].geometry.location.lat();
        data['longitude'] = results[0].geometry.location.lng();

        this.updateDB(data);

      } else {
        console.log('Error: ', results, ' & Status: ', status);
        this.updateDB(data);
      }
    });
  }

  private updatePP(): void {
    const updateObject = {
      name: (this.fullName.value as string).toString().trim(),
      speciality: (this.speciality.value as string).toString().trim(),
      degree: (this.degree.value as string).toString().trim()
    };
    this.updateDB(updateObject);

  }
  private updateAbout() {
    const updateObject = {
      about: (this.about.value as string).toString().trim()
    };
    this.updateDB(updateObject);
  }

  private updateAddress() {

    const updateObject = {
      clinicName: (this.clinicName.value as string).toString().trim(),
      fullClinicAddress: (this.clinicAddress.value as string).toString().trim(),
      country: (this.country.value as string).toString().trim(),
      state: (this.state.value as string).toString().trim(),
      city: (this.city.value as string).toString().trim()
    };
    this.getGeoFromAddress(updateObject);

  }
  private updateDiseases() {
    const updateObject = {
      diseaseSpecialist: this.desease
    };
    this.updateDB(updateObject);
  }
  private updateBankDetails() {

    const updateObject = {
      ifscCode: (this.ifsc.value as string).toString().trim(),
      beneficiary: (this.beneficiaryName.value as string).toString().trim(),
      accountNumber: (this.accountNumber.value as string).toString().trim(),
      accountType: (this.accountType.value as string).toString().trim()
    };

    this.dialogRef.close(this.dialogResponse);
    this.firestore.update("kyc", this.data.userData.getUserId(), updateObject)
      .then(() => {
        console.log("updated!");
      })
      .catch(error => {
        console.log("error, could not update! " + error);
      });

  }
  private updateProfilePicture() {
    const updateObject = {
      picUrl: this.profilePicUrl
    };
    this.updateDB(updateObject);
  }
  ppSubmit(form: FormGroup) {

    if (form.valid) {
      this.updatePP();
    }
  }
  aboutSubmit(form: FormGroup) {
    if (form.valid) {
      this.updateAbout();
    }
  }
  facilitySubmit(form: FormGroup) {
    if (form.valid) {
      this.updateAddress();
    }
  }
  diseasesSubmit(form: FormGroup) {
    if (form.valid) {
      this.updateDiseases();
    }
  }
  bankSubmit(form: FormGroup) {
    if (form.valid) {
      this.updateBankDetails();
    }
  }
}
