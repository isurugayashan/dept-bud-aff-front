import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Privilege} from "../entity/privilege";

@Injectable({
  providedIn: 'root'
})
export class PrivilegeService {

  baseUrl! : string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.serviceEndPoint;
  }

  async getAll(): Promise<Array<Privilege>> {

    const privileges = await this.http.get<Array<Privilege>>(this.baseUrl+'/auth/privileges').toPromise();
    if (privileges == undefined) {
      return [];
    }
    return privileges;
  }

  // @ts-ignore
  async add(distObj: Privilege): Promise<[] | undefined> {
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/privilege',distObj).toPromise();
      return response;
    } catch (error) {
      console.error('An error occurred while adding the privilege:', error);
      return undefined;
    }
  }

  async update(distObj: Privilege): Promise<[] | undefined> {
    console.log(distObj);
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/privilegeup', distObj).toPromise();
      console.log(response);
      return response;
    } catch (error) {
      console.error('An error occurred while update the privilege:', error);
      return undefined;
    }
  }

  async delete(id: number): Promise<[] | undefined> {
    try {
      const response = await this.http.delete<[]>(this.baseUrl+'/auth/privilege/'+id).toPromise();
      console.log(response);
      return response;
    } catch (error) {
      console.error('An error occurred while deleting the privilege:', error);
      return undefined;
    }
  }
}
