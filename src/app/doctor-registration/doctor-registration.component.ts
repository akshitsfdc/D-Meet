import { AngularFirestore } from '@angular/fire/firestore';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { DoctorUserData } from '../models/doctor-user-data';
import { AuthService } from '../services/auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoadingDialogComponent } from '../loading-dialog/loading-dialog.component';
import { stringToKeyValue } from '@angular/flex-layout/extended/typings/style/style-transforms';
import { Router } from '@angular/router';
import { getLocaleDateFormat } from '@angular/common';
import { Timestamp } from 'rxjs/internal/operators/timestamp';

@Component({
  selector: 'app-doctor-registration',
  templateUrl: './doctor-registration.component.html',
  styleUrls: ['./doctor-registration.component.css']
})
export class DoctorRegistrationComponent implements OnInit {
  
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

  constructor(private firebaseAuth: AuthService,private firestore: AngularFirestore,  private matDialog: MatDialog, private router: Router) { 

  }

  ngOnInit(): void {

     this.registrationForm = new FormGroup({
      emailAddress: new FormControl('', [Validators.required, Validators.email]),
      fullName: new FormControl('', Validators.required),
      profileId: new FormControl('', [Validators.required, Validators.minLength(4)]),
      experience : new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      degree : new FormControl('', Validators.required),
      speciality : new FormControl('', Validators.required),
      fullAddress : new FormControl('', [Validators.required, Validators.minLength(15)]),
      clinicName: new FormControl('', Validators.required),
      registrationNumber:new FormControl('', Validators.required)
    });
  
    this.filteredOptionsCountry = this.country.valueChanges
    .pipe(
      startWith(''),
      map(value => this._filter_countries(value))
    );
    this.getDegrees("degree");
    this.getSpecializations("specialization");
    
    this.getUserdata();

    // new Date(1602844757157).toLocaleDateString();
    // Date date = new Date(1602844757157);

    console.log(" 1602844757157  date >> "+new Date(1602846200820).toLocaleDateString());
    console.log(" 1602844757157  time >> "+new Date(1602846200820).toLocaleTimeString());
  }

  passwordChanged(){

    let password = this.password.value as string ;
    if(password.length <= 0){return;}

    let exp:RegExp = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    let valid = exp.test(password);

    if(!valid){
      this.password.setErrors({invalidPassword : true});
    }
    
    // alert("valid : "+valid+" => "+password);

  }
  
  async getUserdata(){
  //   this.currentUser = await this.firebaseAuth.getUser();
  }

  get country(){
    return this.registrationForm.get('country');
  }
  
  get state(){
    return this.registrationForm.get('state');
  }
  get city(){
    return this.registrationForm.get('city');
  }
  get degree(){
    return this.registrationForm.get('degree');
  }
  
  get speciality(){
    return this.registrationForm.get('speciality');
  }
  get fullName(){
    return this.registrationForm.get('fullName');
  }
  get emailAddress(){
    return this.registrationForm.get('emailAddress');
  }
  
  get profileId(){
    return this.registrationForm.get('profileId');
  }
  get experience(){
    return this.registrationForm.get('experience');
  }

  get password(){
    return this.registrationForm.get('password');
  }
  
  get fullAddress(){
    return this.registrationForm.get('fullAddress');
  }
  get clinicName(){
    return this.registrationForm.get('clinicName');
  }
  get registrationNumber(){
    return this.registrationForm.get('registrationNumber');
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
    this.firestore
    .collection('doctor-meta', ref => ref.where("type", "==", type))
    .get().toPromise().then((querySnapshot) => { 
      querySnapshot.forEach((doc) => {          
           this.degrees = doc.data().degrees;
           console.log("this.states : "+this.degrees);
           this.initDegrees();
      }); 
    });
  }
  private getSpecializations(type: string){
    this.firestore
    .collection('doctor-meta', ref => ref.where("type", "==", type))
    .get().toPromise().then((querySnapshot) => { 
      querySnapshot.forEach((doc) => {          
           this.specialists = doc.data().specializations;
           console.log("this.states : "+this.specialists);
           this.initSpeciality();
      }); 
    });
  }
  private getStates(country: string){
    this.firestore
    .collection('states', ref => ref.where("country", "==", country))
    .get().toPromise().then((querySnapshot) => { 
      querySnapshot.forEach((doc) => {          
           this.states = doc.data().states;
           console.log("this.states : "+this.states);
           this.initStates();
      }); 
    });
  }
  private getCities(country: string, state: string){
    console.log("country : "+country);
    console.log("state : "+state);
    this.firestore
    .collection('cities', ref => ref.where("country", "==", country).where("state", "==", state))
    .get().toPromise().then((querySnapshot) => { 
      querySnapshot.forEach((doc) => {          
           this.cities = doc.data().cities;
           console.log("this.cities : "+this.cities);
           this.initCities();
      }); 
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
     this.firestore.collection('user-data', ref => ref.where("profileId", "==", profileId)).get().toPromise()
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
     })
     .catch(error => {
      console.log("error : "+error)
      this.isValidProfileId = false;
     });
  }

  onSubmit(form:FormGroup){
    console.log("In form submit!");

    if(form.valid && this.validateProfileId){
      this.signUpUser((this.emailAddress.value as string).trim(), (this.password.value as string).trim());
    }
    

  }

  private  signUpUser(email:string, password:string){

    this.showLoading();
     this.firebaseAuth.signUp(email, password).then(
      userData => {
        console.log("Success => "+JSON.stringify(userData));
        let user = userData.user.uid; 
        this.saveUserData(user);

      }
    ).catch((failure) => {
        console.log("Failure => "+failure);
        this.hideLoading();
    });
  }

  private saveUserData(userId:string):void{

    let userdata:DoctorUserData = this.getFilledUserdata(userId);

    this.firestore.collection('user-data').doc(userId)
    .set(Object.assign({}, userdata))
     .then(
       () => {
          console.log("Data Saved!");
          this.hideLoading();
          this.router.navigate(['home']);
          
       } 
     ).catch(error =>  {
      console.log(error);
      this.hideLoading();
     }
     
    );
    
  }
  private getFilledUserdata(userId:string):DoctorUserData{

    
    let userData:DoctorUserData = new DoctorUserData();

    userData.setName((this.fullName.value as string).trim());
    userData.setEmail((this.emailAddress.value as string).trim());
    userData.setPicUrl('');
    userData.setUserId(userId.trim());
    userData.setProfileId((this.profileId.value as string).trim());
    userData.setRegistrationNumber((this.registrationNumber.value as string).trim());
    userData.setDegree((this.degree.value as string).trim());
    userData.setSpeciality((this.speciality.value as string).trim());
    userData.setExperience(this.experience.value || 1);
    userData.setClinicName((this.clinicName.value as string).trim());
    userData.setCountry((this.country.value as string).trim());
    userData.setFullClinicAddress((this.fullAddress.value as string).trim());
    userData.setState((this.state.value as string).trim());
    userData.setCity((this.city.value as string).trim());
    userData.setVarified(false);
    userData.setDoctor(true);
    userData.setRegistrationLocalTimeStapm((+ new Date()) || 1000);
    userData.setAbout('');

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
}
