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
import {Sbm} from "../../../entity/sbm";
import {SbmService} from "../../../service/sbm.service";
import {Dahampasal} from "../../../entity/dahampasal";
import {DahampasalService} from "../../../service/dahampasal.service";
import {Status} from "../../../entity/status";
import {User} from "../../../entity/user";
import {UserService} from "../../../service/user.service";
import {AuthenticateService} from "../../../service/AuthenticateService";
import {LoginService} from "../../../service/login.service";
import {Authorizationmanger} from "../../../service/authorizationmanger";

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {
  cols = 12;

  columns: string [] = ['name','email','status','edit']
  headers: string [] = ['User Name','User Email','User Status','Edit']
  binders: string [] = ['name','email','status','getButton()']

  cscolumns: string[] = ['csname','csemail','csStatus'];
  csprompts: string[] = ['Search by User Name','Search by Email','Search by Status'];

  selectedRow: any;
  public form!: FormGroup;
  public csearch!: FormGroup;

  enaadd:boolean =false;
  enaupd:boolean =false;
  enadel:boolean =false;
  enareset:boolean =false;

  oldUserObj!: User | undefined;
  userObj!: User;

  users: Array<User> = [];
  statuses: Status[] = [];
  imageurl : string = '';
  data!: MatTableDataSource<User>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  uiassist : UiAssist;

  constructor(private fb: FormBuilder,
              private matDialog: MatDialog,
              private userService: UserService,
              private a: LoginService,
              private authorizationmanger: Authorizationmanger

  ) {

    this.uiassist = new UiAssist(this);

    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    this.form= this.fb.group({
      'name': new FormControl('',[Validators.required]),
      'password': new FormControl('',[Validators.required]),
      'email': new FormControl('',[Validators.required,Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]),
      'Status': new FormControl('',[Validators.required]),
      'createdate': new FormControl(formattedDate),
    });

    this.csearch = this.fb.group({
      'csname': new FormControl(),
      'csStatus': new FormControl(),
      'csemail': new FormControl()
    });
  }

  getButton(element:District){
    return `<button>Edit</button>`;
  }

  createView() {
    this.imageurl='assets/pending.gif';
    this.loadTable();
  }

  loadTable(){
    this.userService.getAll()
      .then((daham: User[]) => {this.users=daham; this.imageurl='assets/fullfilled.png';})
      .catch((error) => {
        this.matDialog.open(MessageComponent, {
          width: '500px',
          data: {heading: "Status -", message: error.error.message}
        });
        // stsmsg.afterClosed().subscribe(async result => { if (!result) { return;} }) ;} );

        this.imageurl='assets/rejected.png';})
      .finally(()=> {this.data = new MatTableDataSource(this.users); this.data.paginator=this.paginator;});

  }

  ngOnInit(){
    this.initialize();
    this.checkButtonPrivileges();
  }

  initialize(){
    this.createform();
    this.createView();

    // @ts-ignore
    this.statuses = [{id: 1, name: 'Active' },{id: 2, name: 'Inactive' }]
  }

  createform(){
    this.form.controls['name']?.setValidators([Validators.required]);
    this.form.controls['password']?.setValidators([Validators.required]);
    this.form.controls['email']?.setValidators([Validators.required,Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]);
    this.form.controls['Status']?.setValidators([Validators.required]);

    Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {

        if (this.oldUserObj != undefined && control.valid){
          // @ts-ignore
          if (value === this.userObj[controlName]){ control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else{ control.markAsPristine(); }
      });
    }
    this.checkButtonPrivileges();
  }

  checkButtonPrivileges() {
    this.authorizationmanger.getToken(); // Ensure user privileges are loaded
    // Filter for privileges starting with 'district_'
    const userPrivileges = this.authorizationmanger.privileges.filter(
      // @ts-ignore
      privilege => privilege.startsWith('user_')
    );

    // Enable/disable buttons based on privileges
    this.enaadd = userPrivileges.some(privilege => privilege === 'user_add');
    this.enaupd = userPrivileges.some(privilege => privilege === 'user_update');
    this.enadel = userPrivileges.some(privilege => privilege === 'user_delete');
    this.enareset = userPrivileges.some(privilege => privilege === 'user_reset');
  }

  filterTable() {
    const csearchdata = this.csearch.getRawValue();

    // @ts-ignore
    this.data.filterPredicate = (daham: User, filter: string)=>{
      return(csearchdata.csname==null||daham.name.toLowerCase().includes(csearchdata.csname))&&
        (csearchdata.csemail==null||daham.email.toLowerCase().includes(csearchdata.csemail))&&
        (csearchdata.csStatus==null||daham.status.toLowerCase().includes(csearchdata.csStatus));
    }
    this.data.filter="xx";
  }

  fillForm(user: User) {
    this.form.controls['password'].disable();

    this.selectedRow = user;
    this.enaadd = false;

    this.userObj = JSON.parse(JSON.stringify(user));
    this.oldUserObj = JSON.parse(JSON.stringify(user));
     // @ts-ignore
    this.userObj.Status = this.statuses.find(status=> status.name === user.status);

    this.form.patchValue(this.userObj);
    this.form.markAsPristine();
  }


  getErrors(){
    let errors:string='';
    for (const controlName in this.form.controls){
      const control = this.form.controls[controlName];
      if (control.errors){
        {errors =errors+"<br>Invalid "+ controlName;}
      }
    }
    return errors;
  }


  add(){
    let errors = this.getErrors();
    if(errors!=""){
      const errmsg = this.matDialog.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - User Register ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      const data = this.form.getRawValue();
      const formData = new FormData();

      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('status', data.Status.name);
      formData.append('password', data.password);

      let sbmData: string = "";
      sbmData = sbmData + "<br>User_Name is : "+ data.name;
      const confirm = this.matDialog.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - User Add",
          message: "Are you sure to Add the folowing User? <br> <br>"+ sbmData}
      });
      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          this.userService.add(formData).then((responce: []|undefined) => {
            console.log("Res-"+responce);
            console.log("Un-"+responce==undefined);
            if(responce!=undefined){ // @ts-ignore
              console.log("Add-"+responce['id']+"-"+responce['url']+"-"+(responce['errors']==""));
              // @ts-ignore
              addstatus = responce['errors']=="";
              console.log("Add Sta-"+addstatus);
              if(!addstatus) { // @ts-ignore
                addmessage=responce['errors'];
              }
            }
            else{
              // console.log("undefined");
              addstatus=false;
              addmessage="Content Not Found"
            }
          }).catch((error: any) => {
            addstatus=false;
            addmessage= error;
          }).finally( () =>{
            if(addstatus) {
              addmessage = "Successfully Saved";
              this.oldUserObj = undefined;
              this.form.reset();
              Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
              this.checkButtonPrivileges();
              this.loadTable();
            }
            const stsmsg = this.matDialog.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status -User Registerd", message: addmessage}
            });
            stsmsg.afterClosed().subscribe(async result => { if (!result) { return;} }) ;} );
        }
      });
    }
  }

  getUpdates(): string{
    let updates: string = "";
    for (const controlName in this.form.controls){
      const control = this.form.controls[controlName];
      if (control.dirty){
        updates = updates + "<br>" + controlName.charAt(0).toUpperCase() + controlName.slice(1)+" Changed";
      }
    }
    return updates;
  }


  update() {
    let errors = this.getErrors();
    if (errors != "") {
      const errmsg = this.matDialog.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - User Update ", message: "You have following Errors <br> " + errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    } else {
      let updates: string = this.getUpdates();
      if (updates != "") {
        let updstatus: boolean = false;
        let updmessage: string = "Server Not Found";
        const confirm = this.matDialog.open(ConfirmComponent, {
          width: '500px',
          data: {
            heading: "Confirmation - Server Update",
            message: "Are you sure to Save folowing Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {
            const data = this.form.getRawValue();
            // @ts-ignore
            data.id = this.oldUserObj?.id;

            const formData = new FormData();

            formData.append("id", data.id);
            formData.append('name', data.name);
            formData.append('email', data.email);
            formData.append('status', data.Status.name);

            this.userService.update(formData).then((responce: [] | undefined) => {
              if (responce != undefined) { // @ts-ignore
                // @ts-ignore
                updstatus = responce['errors'] == "";

                if (!updstatus) { // @ts-ignore
                  updmessage = responce['errors'];
                }
              } else {
                //console.log("undefined");
                updstatus = false;
                updmessage = "Content Not Found"
              }
            }).catch((error: any) => {
              updstatus=false;
              updmessage= error;
            }).finally(() => {
              if (updstatus) {
                updmessage = "Successfully Updated";
                this.oldUserObj = undefined;
                this.form.reset();
                this.form.controls['password'].enable();
                Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
                this.checkButtonPrivileges();
                this.loadTable();
              }
              const stsmsg = this.matDialog.open(MessageComponent, {
                width: '500px',
                data: {heading: "Status -User Update", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.matDialog.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - User Update", message: "Nothing Changed"}
        });
        updmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
      }
    }
  }

  delete() {
    const confirm = this.matDialog.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - User Delete",
        message: "Are you sure to Delete following User? <br> <br>" +
          this.userObj.name
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";

        this.userService.delete(this.userObj.id).then((responce: [] | undefined) => {
          if (responce != undefined) { // @ts-ignore
            delstatus = responce['errors'] == "";
            if (!delstatus) { // @ts-ignore
              delmessage = responce['errors'];
            }
          } else {
            delstatus = false;
            delmessage = "Content Not Found"
          }
        }).catch((error: any) => {
          delstatus=false;
          delmessage= error;
        } ).finally(() => {
          if (delstatus) {
            delmessage = "Successfully Deleted";
            this.oldUserObj = undefined;
            this.form.reset();
            this.form.controls['password'].enable();
            this.selectedRow ="";
            this.checkButtonPrivileges();
            Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
            this.loadTable();
          }
          const stsmsg = this.matDialog.open(MessageComponent, {
            width: '500px',
            data: {heading: "Status - User Delete ", message: delmessage}
          });
          stsmsg.afterClosed().subscribe(async result => { if (!result) { return; }
          });
        });
      }
    });
  }

  //Clear Form
  clearForm() {
    const confirm = this.matDialog.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - Clear Form",
        message: "Are you sure to Clear folowing Data ? <br> <br>"
      }
    });
    confirm.afterClosed().subscribe(async result =>{
      if (result){
        this.oldUserObj =undefined;
        this.form.reset();
        this.selectedRow ="";
        this.form.controls['password'].enable();
        this.checkButtonPrivileges();
        Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
        this.loadTable();
      }
    });
  }

  reset() {
    const confirm = this.matDialog.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - Rest Password Form",
        message: "Are you sure to Reset Password? <br> <br>"
      }
    });
    confirm.afterClosed().subscribe(async result =>{
      if (result) {
        let restStatus: boolean = false;
        let restMessage: string = "Server Not Found";
        let Responce: string = "";

        const formData = new FormData();

        // @ts-ignore
        formData.append("id", this.userObj.id);
        this.userService.reset(formData).then((responce: [] | undefined) => {
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
            this.oldUserObj = undefined;
            this.form.reset();
            this.form.controls['password'].enable();
            this.selectedRow ="";
            this.checkButtonPrivileges();
            Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
            this.loadTable();
          }
          const stsmsg = this.matDialog.open(MessageComponent, {
            width: '500px',
            data: {heading: "Status - Password Reset ", message: restMessage}
          });
          stsmsg.afterClosed().subscribe(async result => { if (!result) { return; }
          });
        });
      }
    });
  }
}
