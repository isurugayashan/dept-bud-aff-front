import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {User} from "../entity/user";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  baseUrl! : string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.serviceEndPoint;
  }

  async getAll(): Promise<Array<User>> {

    const users = await this.http.get<Array<User>>(this.baseUrl+'/auth/users').toPromise();
    if (users == undefined) {
      return [];
    }
    return users;
  }

  // @ts-ignore
  async add(userObj: FormData): Promise<[] | undefined> {
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/user',userObj).toPromise();
      return response;
    } catch (error) {
      // @ts-ignore
      console.error('An error occurred while adding the user:', error.error);
      throw error;
    }
  }

  async update(userObj: FormData): Promise<[] | undefined> {
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/userup', userObj).toPromise();
      return response;
    } catch (error) {
      // @ts-ignore
      console.error('An error occurred while update the user:', error.error);
      return undefined;
    }
  }

  async delete(id: number): Promise<[] | undefined> {
    try {
      const response = await this.http.delete<[]>(this.baseUrl+'/auth/user/'+id).toPromise();
      return response;
    } catch (error) {
      // @ts-ignore
      console.error('An error occurred while deleting the user:', error.error);
      return undefined;
    }
  }

  getByID(id: number) {
    return this.http.get(this.baseUrl + '/userId/'+id)
  }

  async reset(userObj: FormData): Promise<[] | undefined> {
    try {
      const response = await this.http.post<[]>(this.baseUrl+'/auth/reset/',userObj).toPromise();
      return response;
    } catch (error) {
      // @ts-ignore
      console.error('An error occurred while reset the user:', error.error);
      return undefined;
    }
  }


}
