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
export class ChangepasswordService {

  baseUrl! : string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.serviceEndPoint;
  }


  async changepassword(loginObj: FormData): Promise<[] | undefined> {
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/changepassword',loginObj).toPromise();
      return response;
    } catch (error) {
      // @ts-ignore
      console.error('An error occurred while Change password:', error.error);
      throw error;
    }
  }
}
