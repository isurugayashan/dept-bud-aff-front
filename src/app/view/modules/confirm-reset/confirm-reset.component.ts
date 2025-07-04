import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";

import {HttpClient} from "@angular/common/http";
import {LoginService} from "../../../service/login.service";
import {TokenService} from "../../../service/token.service";
import {AuthenticateService} from "../../../service/AuthenticateService";
import {environment} from "../../../../environments/environment";
import {MessageComponent} from "../../../util/dialog/message/message.component";

@Component({
  selector: 'app-confirm-reset',
  templateUrl: './confirm-reset.component.html',
  styleUrls: ['./confirm-reset.component.css']
})
export class ConfirmResetComponent implements OnInit{

  loginform: FormGroup;
  baseUrl! : string;
  email!: string;
  public error = null;

  constructor(private fb: FormBuilder, private router: Router,
              private dialog: MatDialog,
              private http: HttpClient,
              private loginService: LoginService,private _actRoute: ActivatedRoute,
  ){

    this.baseUrl = environment.serviceEndPoint;

    this.loginform = this.fb.group({

      "code": new FormControl("", [
          Validators.required
        ]
      )
    });

    this.loginform.controls['code'].setValue("");

  }

  ngOnInit(): void {
    this._actRoute.params.subscribe(params => {
      // @ts-ignore
    this.email = params.email;
    });
    }

  authenticate() {
    const data = this.loginform.getRawValue();
    // @ts-ignore
    const formData = new FormData();
    formData.append('code', data.code);
    formData.append('email', this.email);

    this.loginService.confirm(formData).subscribe(
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
        heading: "Confirm Token",
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
        heading: "Confirm - Token",
        message: url
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        this.router.navigateByUrl("login");
      }
    });
  }

  login() {
    this.router.navigateByUrl("login");
  }
}
