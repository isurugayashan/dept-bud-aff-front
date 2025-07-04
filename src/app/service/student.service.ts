import { Injectable } from '@angular/core';
import {District} from "../entity/district";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Sbm} from "../entity/sbm";
import {Student} from "../entity/student";

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  baseUrl! : string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.serviceEndPoint;
  }

  async getAll(): Promise<Array<Student>> {

    const sbms = await this.http.get<Array<Student>>(this.baseUrl+'/auth/students').toPromise();
    if (sbms == undefined) {
      return [];
    }
    return sbms;
  }

  // @ts-ignore
  async add(stuObj: FormData): Promise<[] | undefined> {
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/student',stuObj).toPromise();
      return response;
    } catch (error) {
      // @ts-ignore
      console.error('An error occurred while adding the student:', error.error);
      throw error;
    }
  }

  async update(stuObj: FormData): Promise<[] | undefined> {
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/studentup', stuObj).toPromise();
      return response;
    } catch (error) {
      // @ts-ignore
      console.error('An error occurred while update the student:', error.error);
      return undefined;
    }
  }

  async delete(id: number): Promise<[] | undefined> {
    try {
      const response = await this.http.delete<[]>(this.baseUrl+'/auth/student/'+id).toPromise();
      return response;
    } catch (error) {
      // @ts-ignore
      console.error('An error occurred while deleting the student:', error.error);
      throw error;
    }
  }
}
