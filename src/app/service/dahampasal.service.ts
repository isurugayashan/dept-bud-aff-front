import { Injectable } from '@angular/core';
import {District} from "../entity/district";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Sbm} from "../entity/sbm";
import {Dahampasal} from "../entity/dahampasal";

@Injectable({
  providedIn: 'root'
})
export class DahampasalService {

  baseUrl! : string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.serviceEndPoint;
  }

  async getAll(): Promise<Array<Dahampasal>> {

    const sbms = await this.http.get<Array<Dahampasal>>(this.baseUrl+'/auth/dahampasals').toPromise();
    if (sbms == undefined) {
      return [];
    }
    return sbms;
  }

  // @ts-ignore
  async add(dahamObj: FormData): Promise<[] | undefined> {
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/dahampasala',dahamObj).toPromise();
      return response;
    } catch (error) {
      // @ts-ignore
      console.error('An error occurred while adding the dahampasala:', error.error);
      throw error;
    }
  }

  async update(dahamObj: FormData): Promise<[] | undefined> {
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/dahamup', dahamObj).toPromise();
      return response;
    } catch (error) {
      // @ts-ignore
      console.error('An error occurred while update the dahampasala:', error.error);
      return undefined;
    }
  }

  async delete(id: number): Promise<[] | undefined> {
    try {
      const response = await this.http.delete<[]>(this.baseUrl+'/auth/dahampasala/'+id).toPromise();
      return response;
    } catch (error) {
      // @ts-ignore
      console.error('An error occurred while deleting the dahampasala:', error.error);
      throw error;
    }
  }
}
