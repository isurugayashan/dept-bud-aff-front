import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UiAssist} from "../../../util/ui.assist";
import {MatTableDataSource} from "@angular/material/table";
import {District} from "../../../entity/district";
import {MatPaginator} from "@angular/material/paginator";
import {MatDialog} from "@angular/material/dialog";
import {DistrictService} from "../../../service/district.service";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {ChangepasswordService} from "../../../service/changepassword.service";
import {TokenService} from "../../../service/token.service";
import {UserService} from "../../../service/user.service";

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  cols = 12;

  selectedRow: any;
  public form!: FormGroup;
  userid!: number;

  enaadd: boolean = false;
  enaupd: boolean = false;
  enadel: boolean = false;

  constructor(private fb: FormBuilder,
              private matDialog: MatDialog,
              private changepasswordService: ChangepasswordService,
              private tokenService: TokenService,
              private userService: UserService,
  ) {


    this.form = this.fb.group({
      'oldpassword': new FormControl('', [Validators.required]),
      'newpassword': new FormControl('', [Validators.required]),
    });
  }


  ngOnInit() {
    this.initialize();
    const payload =  this.tokenService.get();
    // @ts-ignore
    const urlUser = payload.split('.')[1];
    this.decode(urlUser)
  }

  decode(urlUser: any) {
    const decodedPayload = JSON.parse(atob(urlUser));
    const id = decodedPayload.sub;
    this.userid = id
  }

  initialize() {
    this.createform();
  }

  createform() {
    this.form.controls['oldpassword']?.setValidators([Validators.required]);
    this.form.controls['newpassword']?.setValidators([Validators.required]);

    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {
        control.markAsPristine();
      });
    }

    this.enaleButtons(true, false, false);
  }

  enaleButtons(add: boolean, upd: boolean, del: boolean) {
    this.enaadd = add;
    this.enaupd = upd;
    this.enadel = del;
  }


  getErrors() {
    let errors: string = '';
    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      if (control.errors) {
        {
          errors = errors + "<br>Invalid " + controlName;
        }
      }
    }
    return errors;
  }


  reset() {
    let errors = this.getErrors();
    if(errors!=""){
      const errmsg = this.matDialog.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Change Password ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
    const confirm = this.matDialog.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - Change Password Form",
        message: "Are you sure to Change Password? <br> <br>"
      }
    });
    confirm.afterClosed().subscribe(async result =>{
      if (result) {
        let restStatus: boolean = false;
        let restMessage: string = "Server Not Found";
        let Responce: string = "";

        const data = this.form.getRawValue();
        const formData = new FormData();

        // @ts-ignore
        formData.append('id', this.userid);
        formData.append('oldPwd', data.oldpassword);
        formData.append('newPwd', data.newpassword);
        this.changepasswordService.changepassword(formData).then((responce: [] | undefined) => {
          // @ts-ignore
          if (responce != undefined) { // @ts-ignore
            Responce = responce.url
            console.log(Responce);
            // @ts-ignore
            restStatus = responce['errors'] == "";
            if (!restStatus) { // @ts-ignore
              restMessage = responce['errors'];
            }
          } else {
            restStatus = false;
            restMessage = "Content Not Found"
          }
        }).catch((error: any) => {
          restStatus=false;
          restMessage= error;
        } ).finally(() => {
          if (restStatus) {
            restMessage = Responce;
            this.form.reset();
            Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
          }
          const stsmsg = this.matDialog.open(MessageComponent, {
            width: '500px',
            data: {heading: "Status - Change Password ", message: restMessage}
          });
          stsmsg.afterClosed().subscribe(async result => { if (!result) { return; }
          });
        });
      }
    });
  }
  }

  //Clear Form
  clearForm() {
    this.form.reset();
    this.selectedRow = "";
    this.enaleButtons(true, false, false);
    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}
