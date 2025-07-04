import { Injectable } from '@angular/core';
import {District} from "../entity/district";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Sbm} from "../entity/sbm";
import {Damexam} from "../entity/damexam";
import {Rolepriv} from "../entity/rolepriv";
import {Userrole} from "../entity/userrole";

@Injectable({
  providedIn: 'root'
})
export class UserroleService {

  baseUrl! : string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.serviceEndPoint;
  }

  async getAll(): Promise<Array<Userrole>> {

    const userroles = await this.http.get<Array<Userrole>>(this.baseUrl+'/auth/userroles').toPromise();
    if (userroles == undefined) {
      return [];
    }
    return userroles;
  }

  // @ts-ignore
  async add(sbmObj: FormData): Promise<[] | undefined> {
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/userrole',sbmObj).toPromise();
      return response;
    } catch (error) {
      console.error('An error occurred while adding the User_vs_Role:', error);
      return undefined;
    }
  }

  async update(sbmObj: FormData): Promise<[] | undefined> {
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/userroleup', sbmObj).toPromise();
      return response;
    } catch (error) {
      console.error('An error occurred while update the User_vs_Role:', error);
      return undefined;
    }
  }

  async delete(id: number): Promise<[] | undefined> {
    try {
      const response = await this.http.delete<[]>(this.baseUrl+'/auth/userrole/'+id).toPromise();
      return response;
    } catch (error) {
      console.error('An error occurred while deleting the User_vs_Role:', error);
      return undefined;
    }
  }
}
