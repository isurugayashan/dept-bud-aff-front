import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Role} from "../entity/role";

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  baseUrl! : string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.serviceEndPoint;
  }

  async getAll(): Promise<Array<Role>> {

    const roles = await this.http.get<Array<Role>>(this.baseUrl+'/auth/roles').toPromise();
    if (roles == undefined) {
      return [];
    }
    return roles;
  }

  // @ts-ignore
  async add(roleObj: Role): Promise<[] | undefined> {
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/role',roleObj).toPromise();
      return response;
    } catch (error) {
      console.error('An error occurred while adding the role:', error);
      return undefined;
    }
  }

  async update(roleObj: Role): Promise<[] | undefined> {
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/roleup', roleObj).toPromise();
      console.log(response);
      return response;
    } catch (error) {
      console.error('An error occurred while update the role:', error);
      return undefined;
    }
  }

  async delete(id: number): Promise<[] | undefined> {
    try {
      const response = await this.http.delete<[]>(this.baseUrl+'/auth/role/'+id).toPromise();
      console.log(response);
      return response;
    } catch (error) {
      console.error('An error occurred while deleting the role:', error);
      return undefined;
    }
  }
}
