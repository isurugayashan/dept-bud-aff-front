import { Injectable } from '@angular/core';
import {District} from "../entity/district";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Sbm} from "../entity/sbm";
import {Dahampasal} from "../entity/dahampasal";
import {User} from "../entity/user";

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  baseUrl! : string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.serviceEndPoint;
  }

  // @ts-ignore
   add(loginObj: FormData) {
   return  this.http.post(this.baseUrl+'/auth/login',loginObj)
  }


  rest(restObj: FormData) {
    return  this.http.post(this.baseUrl+'/auth/changeclient',restObj)
  }

  confirm(confObj: FormData) {
    return  this.http.post(this.baseUrl+'/auth/confirmotp',confObj)
  }
}
