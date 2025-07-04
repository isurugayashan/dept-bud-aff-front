import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Excenter} from "../entity/excenter";

@Injectable({
  providedIn: 'root'
})
export class ExcenterService {

  baseUrl! : string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.serviceEndPoint;
  }

  async getAll(): Promise<Array<Excenter>> {

    const excenters = await this.http.get<Array<Excenter>>(this.baseUrl+'/auth/excenters').toPromise();
    if (excenters == undefined) {
      return [];
    }
    return excenters;
  }

  // @ts-ignore
  async add(distObj: Excenter): Promise<[] | undefined> {
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/excenter',distObj).toPromise();
      return response;
    } catch (error) {
      console.error('An error occurred while adding the excenter:', error);
      return undefined;
    }
  }

  async update(distObj: Excenter): Promise<[] | undefined> {
    console.log(distObj);
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/excenterup', distObj).toPromise();
      console.log(response);
      return response;
    } catch (error) {
      console.error('An error occurred while update the excenter:', error);
      return undefined;
    }
  }

  async delete(id: number): Promise<[] | undefined> {
    try {
      const response = await this.http.delete<[]>(this.baseUrl+'/auth/excenter/'+id).toPromise();
      console.log(response);
      return response;
    } catch (error) {
      console.error('An error occurred while deleting the excenter:', error);
      return undefined;
    }
  }
}
