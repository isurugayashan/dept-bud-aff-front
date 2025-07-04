import { Injectable } from '@angular/core';
import {District} from "../entity/district";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Teacher} from "../entity/teacher";

@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  baseUrl! : string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.serviceEndPoint;
  }

  async getAll(): Promise<Array<Teacher>> {

    const teachers = await this.http.get<Array<Teacher>>(this.baseUrl+'/auth/teachers').toPromise();
    if (teachers == undefined) {
      return [];
    }
    return teachers;
  }

  async getById(id: number): Promise<Array<Teacher> | undefined> {
    try {
      const teacher = await this.http.get<Array<Teacher>>(`${this.baseUrl}/teacherId/${id}`).toPromise();
      return teacher;
    } catch (error) {
      console.error('Error fetching teacher by ID:', error);
      // @ts-ignore
      return error;
    }
  }

  // @ts-ignore
  async add(stuObj: FormData): Promise<[] | undefined> {
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/teacher',stuObj).toPromise();
      return response;
    } catch (error) {
      // @ts-ignore
      console.error('An error occurred while adding the teacher:', error.error);
      throw error;
    }
  }

  async update(stuObj: FormData): Promise<[] | undefined> {
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/teacherup', stuObj).toPromise();
      return response;
    } catch (error) {
      // @ts-ignore
      console.error('An error occurred while update the teacher:', error.error);
      return undefined;
    }
  }

  async delete(id: number): Promise<[] | undefined> {
    try {
      const response = await this.http.delete<[]>(this.baseUrl+'/auth/teacher/'+id).toPromise();
      return response;
    } catch (error) {
      // @ts-ignore
      console.error('An error occurred while deleting the teacher:', error.error);
      throw error;
    }
  }
}
