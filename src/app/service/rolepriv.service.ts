import { Injectable } from '@angular/core';
import {District} from "../entity/district";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Sbm} from "../entity/sbm";
import {Damexam} from "../entity/damexam";
import {Rolepriv} from "../entity/rolepriv";

@Injectable({
  providedIn: 'root'
})
export class RoleprivService {

  baseUrl! : string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.serviceEndPoint;
  }

  async getAll(): Promise<Array<Rolepriv>> {

    const roleprivs = await this.http.get<Array<Rolepriv>>(this.baseUrl+'/auth/roleprivileges').toPromise();
    if (roleprivs == undefined) {
      return [];
    }
    return roleprivs;
  }

  // @ts-ignore
  async add(sbmObj: FormData): Promise<[] | undefined> {
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/roleprivilege',sbmObj).toPromise();
      return response;
    } catch (error) {
      console.error('An error occurred while adding the Role_vs_Privilege:', error);
      return undefined;
    }
  }

  async update(sbmObj: FormData): Promise<[] | undefined> {
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/roleprivilegeup', sbmObj).toPromise();
      return response;
    } catch (error) {
      console.error('An error occurred while update the Role_vs_Privilege:', error);
      return undefined;
    }
  }

  async delete(id: number): Promise<[] | undefined> {
    try {
      const response = await this.http.delete<[]>(this.baseUrl+'/auth/roleprivilege/'+id).toPromise();
      return response;
    } catch (error) {
      console.error('An error occurred while deleting the Role_vs_Privilege:', error);
      return undefined;
    }
  }
}
