import { Injectable } from '@angular/core';
import {District} from "../entity/district";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Sbm} from "../entity/sbm";
import {Damexam} from "../entity/damexam";

@Injectable({
  providedIn: 'root'
})
export class DamexamService {

  baseUrl! : string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.serviceEndPoint;
  }

  async getAll(): Promise<Array<Damexam>> {

    const dahamexams = await this.http.get<Array<Damexam>>(this.baseUrl+'/auth/dahamexams').toPromise();
    if (dahamexams == undefined) {
      return [];
    }
    return dahamexams;
  }

  // @ts-ignore
  async add(sbmObj: FormData): Promise<[] | undefined> {
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/dahamexam',sbmObj).toPromise();
      return response;
    } catch (error) {
      console.error('An error occurred while adding the Daham_vs_Center:', error);
      return undefined;
    }
  }

  async update(sbmObj: FormData): Promise<[] | undefined> {
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/dahamexamup', sbmObj).toPromise();
      return response;
    } catch (error) {
      console.error('An error occurred while update the Daham_vs_Center:', error);
      return undefined;
    }
  }

  async delete(id: number): Promise<[] | undefined> {
    try {
      const response = await this.http.delete<[]>(this.baseUrl+'/auth/dahamexam/'+id).toPromise();
      return response;
    } catch (error) {
      console.error('An error occurred while deleting the Daham_vs_Center:', error);
      return undefined;
    }
  }
}
