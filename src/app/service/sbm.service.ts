import { Injectable } from '@angular/core';
import {District} from "../entity/district";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Sbm} from "../entity/sbm";

@Injectable({
  providedIn: 'root'
})
export class SbmService {

  baseUrl! : string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.serviceEndPoint;
  }

  async getAll(): Promise<Array<Sbm>> {

    const sbms = await this.http.get<Array<Sbm>>(this.baseUrl+'/auth/sbms').toPromise();
    if (sbms == undefined) {
      return [];
    }
    return sbms;
  }

  // @ts-ignore
  async add(sbmObj: FormData): Promise<[] | undefined> {
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/sbm',sbmObj).toPromise();
      return response;
    } catch (error) {
      console.error('An error occurred while adding the sbm:', error);
      return undefined;
    }
  }

  async update(sbmObj: FormData): Promise<[] | undefined> {
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/sbmup', sbmObj).toPromise();
      return response;
    } catch (error) {
      console.error('An error occurred while update the sbm:', error);
      return undefined;
    }
  }

  async delete(id: number): Promise<[] | undefined> {
    try {
      const response = await this.http.delete<[]>(this.baseUrl+'/auth/sbm/'+id).toPromise();
      return response;
    } catch (error) {
      console.error('An error occurred while deleting the sbm:', error);
      return undefined;
    }
  }
}
