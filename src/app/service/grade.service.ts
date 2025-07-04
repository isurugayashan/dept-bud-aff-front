import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Grade} from "../entity/grade";
import {Dahamgrade} from "../entity/dahamgrade";
import {Dahamgradeold} from "../entity/dahamgradeold";

@Injectable({
  providedIn: 'root'
})
export class GradeService {

  baseUrl! : string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.serviceEndPoint;
  }

  async getAll(): Promise<Array<Grade>> {

    const grades = await this.http.get<Array<Grade>>(this.baseUrl+'/auth/grades').toPromise();
    if (grades == undefined) {
      return [];
    }
    return grades;
  }

  async getAlldahamgrades(): Promise<Array<Dahamgradeold>> {

    const dahamgrades = await this.http.get<Array<Dahamgradeold>>(this.baseUrl+'/auth/dahamgrades').toPromise();
    if (dahamgrades == undefined) {
      return [];
    }
    return dahamgrades;
  }

  // @ts-ignore
  async add(data: FormData): Promise<[] | undefined> {

    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/dahamgrade',data).toPromise();
      return response;
    } catch (error) {
      console.error('An error occurred while adding the grade:', error);
      return undefined;
    }
  }

  async update(data: FormData): Promise<[] | undefined> {
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/dahamgradeup', data).toPromise();
      console.log(response);
      return response;
    } catch (error) {
      console.error('An error occurred while update the grade:', error);
      return undefined;
    }
  }

  async delete(id: number): Promise<[] | undefined> {
    try {
      const response = await this.http.delete<[]>(this.baseUrl+'/auth/dahamgrade/'+id).toPromise();
      console.log(response);
      return response;
    } catch (error) {
      console.error('An error occurred while deleting the grade:', error);
      return undefined;
    }
  }
}
