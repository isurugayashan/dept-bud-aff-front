import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private iss = {
    login : 'http://localhost:8440/api/auth/login'
  }

  constructor() { }

  handle(access_token: any) {
  this.set(access_token);
    // console.log(access_token);
    // console.log(this.isValid())
  }

  set(access_token: any){
    localStorage.setItem('token' ,access_token);
  }

  get(){
    return localStorage.getItem('token');
  }
  remove(){
    localStorage.removeItem('token');
  }

  isValid(){
    const  token = this.get();
    if (token){
      const  payload = this.payload(token);
      if (payload){
        return Object.values(this.iss).indexOf(payload.iss) > -1 ? true: false;
      }
    }
    return false;
  }


  private payload(access_token: any) {
    const payload = access_token.split('.')[1];
    return  this.decode(payload)
  }

  private decode(payload: any) {
    return JSON.parse(atob(payload));
  }

  loggedIn(){
    return this.isValid();
  }
}
