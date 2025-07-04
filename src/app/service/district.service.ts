import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {District} from "../entity/district";

@Injectable({
  providedIn: 'root'
})
export class DistrictService {

  baseUrl! : string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.serviceEndPoint;
  }

  async getAll(): Promise<Array<District>> {

    const districts = await this.http.get<Array<District>>(this.baseUrl+'/auth/districts').toPromise();
    if (districts == undefined) {
      return [];
    }
    return districts;
  }

  // @ts-ignore
  async add(distObj: District): Promise<[] | undefined> {
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/district',distObj).toPromise();
      return response;
    } catch (error) {
      console.error('An error occurred while adding the district:', error);
      return undefined;
    }
  }

  async update(distObj: District): Promise<[] | undefined> {
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/districtup', distObj).toPromise();
      console.log(response);
      return response;
    } catch (error) {
      console.error('An error occurred while update the district:', error);
      return undefined;
    }
  }

  async delete(id: number): Promise<[] | undefined> {
    try {
      const response = await this.http.delete<[]>(this.baseUrl+'/auth/district/'+id).toPromise();
      console.log(response);
      return response;
    } catch (error) {
      console.error('An error occurred while deleting the district:', error);
      return undefined;
    }
  }
}
