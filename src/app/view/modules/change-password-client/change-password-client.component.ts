import {Component} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";

import {HttpClient} from "@angular/common/http";
import {LoginService} from "../../../service/login.service";
import {TokenService} from "../../../service/token.service";
import {AuthenticateService} from "../../../service/AuthenticateService";
import {environment} from "../../../../environments/environment";
import {MessageComponent} from "../../../util/dialog/message/message.component";

@Component({
  selector: 'app-change-password-client',
  templateUrl: './change-password-client.component.html',
  styleUrls: ['./change-password-client.component.css']
})
export class ChangePasswordClientComponent {

  loginform: FormGroup;
  baseUrl! : string;
  email! : string;

  public error = null;

  constructor(private fb: FormBuilder, private router: Router,
              private dialog: MatDialog,
              private http: HttpClient,
              private loginService: LoginService,
              ){

    this.baseUrl = environment.serviceEndPoint;

    this.loginform = this.fb.group({

      "email": new FormControl("", [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
        ]
      )
    });

    this.loginform.controls['email'].setValue("");

  }

  authenticate() {
    const data = this.loginform.getRawValue();
    this.email = data.email;
    const formData = new FormData();
    formData.append('email', data.email);

    this.loginService.rest(formData).subscribe(
      data => {
        const user = this.handleResponse(data);
      },
      error => this.handleError(error)
    );
  }

  handleError(error: { error: null; }){
    // @ts-ignore
    console.log(error.error.errors);
    // @ts-ignore
    this.error = error.error.errors
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
  }
  // @ts-ignore
  private handleResponse({url}: Object) {

    // @ts-ignore
    const dialogRef = this.dialog.open(MessageComponent, {
      width: '500px',
      data: {
        heading: "Valid Email Details",
        message: url
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        const encodedEmail = encodeURIComponent(this.email);
        this.router.navigateByUrl("confirm-rest/" + encodedEmail);
      }
    });
  }

  login() {
    this.router.navigateByUrl("login");
  }
}
