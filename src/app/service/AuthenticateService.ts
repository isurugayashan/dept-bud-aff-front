import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {TokenService} from "./token.service";

@Injectable({
  providedIn: 'root'
})
export class AuthenticateService {

  private loggedIn = new BehaviorSubject<boolean>(this.tokenService.loggedIn());

  authStatus = this.loggedIn.asObservable();

  changeAuthStatus(value:boolean){
    this.loggedIn.next(value);
  }

  constructor(private http: HttpClient,
              private tokenService:TokenService) {
  }



  // async authenticate(username: string, password: string): Promise<any | undefined> {
  //
  //   return this.http.post<any>("http://localhost/miserver/", {
  //     username: username,
  //     password: password,
  //     headers: {"Content-type": "application/x-www-form-urlencoded"}
  //   }).toPromise();
  //
  // }


}
