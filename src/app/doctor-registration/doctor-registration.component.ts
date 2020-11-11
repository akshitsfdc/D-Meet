import { FirestoreService } from './../services/firestore.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoadingDialogComponent } from '../loading-dialog/loading-dialog.component';
import { stringToKeyValue } from '@angular/flex-layout/extended/typings/style/style-transforms';
import { Router } from '@angular/router';
import { getLocaleDateFormat } from '@angular/common';
import { Timestamp } from 'rxjs/internal/operators/timestamp';
import { DoctorUserData } from '../models/doctor-user-data';
import { error } from 'protractor';

@Component({
  selector: 'app-doctor-registration',
  templateUrl: './doctor-registration.component.html',
  styleUrls: ['./doctor-registration.component.css']
})
export class DoctorRegistrationComponent implements OnInit {
  
  options:any;
  selectedAddress:string = null;
  selectedLat = 28.564302;
  selectedLong = 77.250064

  showProgressBar:boolean = false;

  //for password field
  hide = true;

  countries = ["India"];

  specialists = [];
  degrees = [];

  states = [];
  cities = [];
  filteredOptionsCountry: Observable<string[]>;
  filteredOptionsState: Observable<string[]>;
  filteredOptionsCity: Observable<string[]>;
  filteredOptionsDegree : Observable<string[]>;
  filteredOptionsSpeciality: Observable<string[]>;
  registrationForm: FormGroup;

  isValidProfileId: boolean = false;
  showInvalidProfileId:boolean = false;

  private loadingIndicator : MatDialogRef<any>;

  constructor(private firebaseAuth: AuthService, private firestore: FirestoreService,  private matDialog: MatDialog, private router: Router) { 

  }

  ngOnInit(): void {

     this.registrationForm = new FormGroup({
       'first' : new FormGroup({
        firstName : new FormControl('', [Validators.required]),
        emailAddress: new FormControl('', [Validators.required, Validators.email]),
        lastName: new FormControl('', Validators.required),
        gender : new FormControl('female', Validators.required),
        profileId: new FormControl('', [Validators.required, Validators.minLength(4)]),
        password: new FormControl('', Validators.required),
        confirmPassword: new FormControl('', Validators.required)
       }),
       'personal' : new FormGroup({
          registrationNumber:new FormControl('', Validators.required),
          experience : new FormControl('', Validators.required),
          degree : new FormControl('', Validators.required),
          speciality : new FormControl('', Validators.required),
          about: new FormControl('')
       }),
       'address' : new FormGroup({
        clinicName: new FormControl('', Validators.required),
        mapAddress: new FormControl('',Validators.required),
        fullAddress : new FormControl('', [Validators.required, Validators.minLength(15)]),
        country: new FormControl('India', Validators.required),
        state: new FormControl('', Validators.required),
        city: new FormControl('', Validators.required)
     })
      
    });
  
    

    // new Date(1602844757157).toLocaleDateString();
    // Date date = new Date(1602844757157);

    // console.log(" 1602844757157  date >> "+new Date(1602846200820).toLocaleDateString());
    // console.log(" 1602844757157  time >> "+new Date(1602846200820).toLocaleTimeString());

    let randomSessionStr =  new google.maps.places.AutocompleteSessionToken();

    this.options = { componentRestrictions:{ country:["IN"]}, sessionToken : randomSessionStr };
         
        
      
      
    
  }

  loadPersonal(){
    this.getDegrees("degree");
    this.getSpecializations("specialization");
  }
  loadAddressFormData(){
    this.filteredOptionsCountry = this.country.valueChanges
    .pipe(
      startWith(''),
      map(value => this._filter_countries(value))
    );
    this.getStates((this.country.value as string).trim()); 
  }
  passwordChanged(){

    let password = this.password.value as string ;
    if(password.length <= 0){return;}

    let exp:RegExp = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    let valid = exp.test(password);

    if(!valid){
      this.password.setErrors({invalidPassword : true});
    }
    
    this.passwordequality();
    // alert("valid : "+valid+" => "+password);

  }
  
  passwordequality(){
    this.confirmPassword.setErrors(null);
    const pass = ((this.password.value as string).trim()).toLowerCase();
    const rePass = ((this.confirmPassword.value as string).trim()).toLowerCase();
    if(pass !== rePass){
      this.confirmPassword.setErrors({
        notEqalTo : true
      });
    }
  }

  get firstForm(){
    return this.registrationForm.get('first');
  }
  get personalForm(){
    return this.registrationForm.get('personal');
  }
  get addressForm(){
    return this.registrationForm.get('address');
  }
  get about(){
    return this.registrationForm.get('personal').get('about');
  }
  
  get country(){
    return this.registrationForm.get('address').get('country');
  }
  
  get state(){
    return this.registrationForm.get('address').get('state');
  }
  get city(){
    return this.registrationForm.get('address').get('city');
  }
  get degree(){
    return this.registrationForm.get('personal').get('degree');
  }
  
  get speciality(){
    return this.registrationForm.get('personal').get('speciality');
  }
  get firstName(){
    return this.registrationForm.get('first').get('firstName');
  }
  get lastName(){
    return this.registrationForm.get('first').get('lastName');
  }
  get emailAddress(){
    return this.registrationForm.get('first').get('emailAddress');
  }
  
  get profileId(){
    return this.registrationForm.get('first').get('profileId');
  }
  get experience(){
    return this.registrationForm.get('personal').get('experience');
  }
  get gender(){
    return this.registrationForm.get('first').get('gender');
  }
  get password(){
    return this.registrationForm.get('first').get('password');
  }
  get confirmPassword(){
    return this.registrationForm.get('first').get('confirmPassword');
  }
  
  
  get fullAddress(){
    return this.registrationForm.get('address').get('fullAddress');
  }
  get clinicName(){
    return this.registrationForm.get('address').get('clinicName');
  }
  get mapAddress(){
    return this.registrationForm.get('address').get('mapAddress');
  }
  get registrationNumber(){
    return this.registrationForm.get('personal').get('registrationNumber');
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
  onCountrySelected(selectedValue:string):void{
    this.state.patchValue('');
    this.states = [];
     this.getStates(selectedValue);
  }

  onStateSelected(selectedValue:string):void{
    this.city.patchValue('');
    this.cities = [];
    console.log("this.country.value.length "+this.country.value.length);
    if(this.country.value.length <= 0){
      return;
    }
    this.getCities(this.country.value, selectedValue);
  }
  onCitySelected(selectedValue:string):void{

  }
  onDegreeSelected(selectedValue:string):void{

  }
  onSpecialitySelected(selectedValue:string):void{
  }
  private getDegrees(type: string){

    this.showProgressBar = true;

    this.firestore.getEquals('doctor-meta', 'type', type)
    .then((querySnapshot) => { 
      querySnapshot.forEach((doc) => {          
           this.degrees = doc.data().degrees;
           this.initDegrees();
      }); 
      this.showProgressBar = false;
    })
    .catch(error => {
      //error
      this.showProgressBar = false;
    });
  }
  private getSpecializations(type: string){

    this.showProgressBar = true;
    this.firestore.getEquals('doctor-meta', 'type', type).then((querySnapshot) => { 
      querySnapshot.forEach((doc) => {          
           this.specialists = doc.data().specializations;
           console.log("this.states : "+this.specialists);
           this.initSpeciality();
      }); 
      this.showProgressBar = false;
    })
    .catch(error => {
      //error
      this.showProgressBar = false;
    });
  }
  private getStates(country: string){

    this.showProgressBar = true;
    this.firestore.getEquals('states','country',country)
    .then((querySnapshot) => { 
      querySnapshot.forEach((doc) => {          
           this.states = doc.data().states;
           console.log("this.states : "+this.states);
           this.initStates();
      }); 
      this.showProgressBar = false;
    })
    .catch(error => {
      //error
      this.showProgressBar = false;
    });
  }
  private getCities(country: string, state: string){

    this.showProgressBar = true;
    this.firestore.getEqualsDouble('cities', 'country', country, 'state', state)
    .then((querySnapshot) => { 
      querySnapshot.forEach((doc) => {          
           this.cities = doc.data().cities;
           console.log("this.cities : "+this.cities);
           this.initCities();
      }); 
      this.showProgressBar = false;
    })
    .catch(error => {
      //error
      this.showProgressBar = false;
    });
  }

  private initDegrees():void{
    this.filteredOptionsDegree = this.degree.valueChanges
    .pipe(
      startWith(''),
      map(value => this._filter_degrees(value))
    );
  }
  private initSpeciality():void{
    this.filteredOptionsSpeciality = this.speciality.valueChanges
    .pipe(
      startWith(''),
      map(value => this._filter_specialities(value))
    );
  }
  private initStates():void{
    this.filteredOptionsState = this.state.valueChanges
    .pipe(
      startWith(''),
      map(value => this._filter_states(value))
    );
  }
  private initCities():void{
    this.filteredOptionsCity = this.city.valueChanges
    .pipe(
      startWith(''),
      map(value => this._filter_cities(value))
    );
  }

  validateProfileId(){
    console.log("$event : ");
    if(this.profileId.valid){
      this.checkUsernameAvailability((this.profileId.value as string).toLowerCase().replace(/ /g,''));
    }
  }
  onProfileIdEdited(){
    this.isValidProfileId = false;
    this.showInvalidProfileId = false;
    if((this.profileId.value as string).length > 0){
      this.profileId.setValue((this.profileId.value as string).toLowerCase().replace(/[^a-zA-Z0-9_]/g, ''));
    }
    
  }
  private checkUsernameAvailability(profileId:string):void{

    if(profileId.length <= 0){
      return;
    }
    this.showProgressBar = true;
     this.firestore.getEquals('user-data', 'profileId', profileId)
     .then(queySnapshot => {
      console.log("queySnapshot.size : "+queySnapshot.size);
        if(queySnapshot && queySnapshot.size == 0){
          this.isValidProfileId = true;
          this.showInvalidProfileId = false;
        }else{
          this.isValidProfileId = false;
          this.showInvalidProfileId = true;
          this.profileId.setErrors({'available': "Not available"});
        }
        this.showProgressBar = false;
     })
     .catch(error => {
      console.log("error : "+error)
      this.isValidProfileId = false;
      
      this.showProgressBar = false;
      //error
     });
  }

  onSubmit(form:FormGroup){
    console.log("In form submit!");

    if(this.selectedAddress !== null && form.valid){
      this.signUpUser((this.emailAddress.value as string).trim(), (this.password.value as string).trim());
    }
    

  }

  private  signUpUser(email:string, password:string){

    this.showLoading();
     this.firebaseAuth.signUp(email, password).then(
      userData => {
        console.log("Success => "+JSON.stringify(userData));
        let user = userData.user.uid; 
        this.saveIdentityData(user);

      }
    ).catch((failure) => {
        console.log("Failure => "+failure);
        this.hideLoading();
        //error
    });
  }

  private saveIdentityData(userId:string):void{

    this.firestore.save('user-identity',userId, {doctor : true})
    .then(() => {
      this.saveUserData(userId);
    })
    .catch((failure) => {
        //error
        this.hideLoading();
    });
  }
  private saveUserData(userId:string):void{

    let userdata:DoctorUserData = this.getFilledUserdata(userId);

    this.firestore.save('user-data', userId, Object.assign({}, userdata))
     .then(
       () => {
          console.log("Data Saved!");
          this.hideLoading();
          this.router.navigate(['doctor']);
          
       } 
     ).catch(error =>  {
      console.log(error);
      this.hideLoading();
      //error
     }     
    );
    
  }
  private getFilledUserdata(userId:string):DoctorUserData{

    
    let userData:DoctorUserData = new DoctorUserData();

    userData.setFirstName((this.firstName.value as string).trim());
    userData.setLastName((this.lastName.value as string).trim());
    userData.setGender((this.gender.value as string).trim());
    userData.setUserId(userId.trim());
    userData.setProfileId((this.profileId.value as string).trim());
    userData.setEmail((this.emailAddress.value as string).trim());
    userData.setRegistrationNumber((this.registrationNumber.value as string).trim());
    userData.setExperience(this.experience.value || 1);
    userData.setDegree((this.degree.value as string).trim());
    userData.setSpeciality((this.speciality.value as string).trim());
    userData.setAbout((this.about.value as string).trim());
    userData.setClinicName((this.clinicName.value as string).trim());
    userData.setLatitude(this.selectedLat);
    userData.setLongitude(this.selectedLong);
    userData.setNearbyAddress(this.selectedAddress);
    userData.setCountry((this.country.value as string).trim());
    userData.setFullClinicAddress((this.fullAddress.value as string).trim());
    userData.setState((this.state.value as string).trim());
    userData.setCity((this.city.value as string).trim());
    userData.setVarified(false);
    userData.setRegistrationLocalTimeStapm((+ new Date()) || 1000);
    userData.setDiseaseSpecialist([]);//to be completed in profile
    userData.setKycSubmitted(false);
    
    userData.setPicUrl('');

    return userData;
  }

  private showLoading():void{
    this.loadingIndicator = this.matDialog.open(LoadingDialogComponent, {disableClose: true});
  }
  private hideLoading():void{
    if(this.loadingIndicator){
      this.loadingIndicator.close();
    }   

  }

  handleAddressChange(address:any){

    let lat = address.geometry.location.lat();
    let long = address.geometry.location.lng();

    this.selectedLat = lat;
    this.selectedLong = long;

    this.selectedAddress = address.formatted_address;

    console.log("lat : "+this.selectedAddress);
    console.log("long : "+long);

  }
}
