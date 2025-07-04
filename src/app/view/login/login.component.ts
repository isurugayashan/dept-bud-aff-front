import {Component} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {MessageComponent} from "../../util/dialog/message/message.component";
import {LoginService} from "../../service/login.service";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {Subscription} from "rxjs";
import {TokenService} from "../../service/token.service";
import {AuthenticateService} from "../../service/AuthenticateService";
import {Authorizationmanger} from "../../service/authorizationmanger";
import {Dahamgradeold} from "../../entity/dahamgradeold";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginform: FormGroup;
  baseUrl! : string;
  roles!: string[]; // Array of role names
  privileges!: string[]; // Array of privilege names
  public error = null;
  dahamgradeObj2!: Dahamgradeold;
  constructor(private fb: FormBuilder, private router: Router,
              private dialog: MatDialog,
              private http: HttpClient,
              private loginService: LoginService,
              private tokenService: TokenService,
              private authenticateService: AuthenticateService,
              private authorizationmanger:Authorizationmanger){

    this.baseUrl = environment.serviceEndPoint;

    this.loginform = this.fb.group({

      "email": new FormControl("", [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
        ]
      ),

      "password": new FormControl("",)

    });

    this.loginform.controls['email'].setValue("");
    this.loginform.controls['password'].setValue("");


  }

  authenticate() {
    const data = this.loginform.getRawValue();
    const formData = new FormData();

    formData.append('email', data.email);
    formData.append('password', data.password);
    this.loginService.add(formData).subscribe(
      data => {
        this.handleResponse(data);

      },
      error => this.handleError(error)
    );
    //console.log(user)
  }

  handleError(error: { error: null; }){
    console.log(error);
    // @ts-ignore
    this.error = error.error.error
    const dialogRef = this.dialog.open(MessageComponent, {
          width: '500px',
          data: {
            heading: "Invalid Login Details",
            message: this.error
          }
        });

        dialogRef.afterClosed().subscribe(async result => {
          if (!result) {
            return;
          }
        });

        this.router.navigateByUrl("login");
  }
  signup(): void {
    this.router.navigateByUrl("changepasswordclient");
  }


  private handleResponse(data: Object) {

    // @ts-ignore
    this.tokenService.handle(data.access_token);

    this.authenticateService.changeAuthStatus(true);
    this.router.navigateByUrl("main/home");
    // @ts-ignore
    localStorage.setItem('username', data.user.name.toString());
    // @ts-ignore
    localStorage.setItem('teacher', JSON.stringify(data.user.teacher));
    // @ts-ignore
    localStorage.setItem('dahamschool', JSON.stringify(data.user.dahamschools));
    // @ts-ignore
    localStorage.setItem('sbm', JSON.stringify(data.user.sbm));
    // @ts-ignore
    localStorage.setItem('grade', JSON.stringify(data.user.grade));
    // @ts-ignore


  //  localStorage.setItem('dahamschool', JSON.stringify());
    this.authorizationmanger.getToken()
  }
}
