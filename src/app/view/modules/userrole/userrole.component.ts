import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UiAssist} from "../../../util/ui.assist";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatDialog} from "@angular/material/dialog";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {Dahampasal} from "../../../entity/dahampasal";
import {DahampasalService} from "../../../service/dahampasal.service";
import {Excenter} from "../../../entity/excenter";
import {ExcenterService} from "../../../service/excenter.service";
import {Damexam} from "../../../entity/damexam";
import {DamexamService} from "../../../service/damexam.service";
import {DatePipe} from "@angular/common";
import {Rolepriv} from "../../../entity/rolepriv";
import {Role} from "../../../entity/role";
import {Privilege} from "../../../entity/privilege";
import {RoleService} from "../../../service/role.service";
import {PrivilegeService} from "../../../service/privilege.service";
import {RoleprivService} from "../../../service/rolepriv.service";
import {User} from "../../../entity/user";
import {Userrole} from "../../../entity/userrole";
import {UserService} from "../../../service/user.service";
import {UserroleService} from "../../../service/userrole.service";
import {Authorizationmanger} from "../../../service/authorizationmanger";

@Component({
  selector: 'app-userrole',
  templateUrl: './userrole.component.html',
  styleUrls: ['./userrole.component.css']
})
export class UserroleComponent {
  cols = 12;

  columns: string [] = ['user','role','edit']
  headers: string [] = ['User Name','Role Name','Edit']
  binders: string [] = ['user.name','role.name','getButton()']

  cscolumns: string[] = ['csUser','csRole'];
  csprompts: string[] = ['Search by User','Search by Role'];

  selectedRow: any;
  public form!: FormGroup;
  public csearch!: FormGroup;

  enaadd:boolean =false;
  enaupd:boolean =false;
  enadel:boolean =false;

  oldUserRoleObj!: Userrole | undefined;
  userRoleObj!: Userrole;

  roles: Array<Role> = [];
  users: Array<User> = [];
  userroles: Array<Userrole> = [];
  imageurl : string = '';
  data!: MatTableDataSource<Userrole>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  uiassist : UiAssist;

  constructor(private fb: FormBuilder,
              private matDialog: MatDialog,
              private userroleService: UserroleService,
              private roleService: RoleService,
              private userService: UserService,
              private dp: DatePipe,
              private authorizationmanger: Authorizationmanger
  ) {

    this.uiassist = new UiAssist(this);

    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    this.form= this.fb.group({
      'role': new FormControl('',[Validators.required]),
      'user': new FormControl('',[Validators.required]),
      'createdate': new FormControl(formattedDate),
    });

    this.csearch = this.fb.group({
      'csRole': new FormControl(),
      'csUser': new FormControl(),
    });
  }

  getButton(element:Userrole){
    return `<button>Edit</button>`;
  }

  createView() {
    this.imageurl='assets/pending.gif';
    this.loadTable();
  }

  loadTable(){
    this.userroleService.getAll()
      .then((daham: Userrole[]) => {this.userroles=daham; this.imageurl='assets/fullfilled.png';})
      .catch((error) => {
        this.matDialog.open(MessageComponent, {
          width: '500px',
          data: {heading: "Status -", message: error.error.message}
        });
        // stsmsg.afterClosed().subscribe(async result => { if (!result) { return;} }) ;} );

        this.imageurl='assets/rejected.png';})
      .finally(()=> {this.data = new MatTableDataSource(this.userroles); this.data.paginator=this.paginator;});
  }

  ngOnInit(){
    this.initialize();
    this.checkButtonPrivileges();
  }

  initialize(){
    this.createform();
    this.createView();

    this.roleService.getAll().then((sbms: Role[]) =>{this.roles = sbms;});

    this.userService.getAll().then((sbms: User[]) =>{this.users = sbms;});

  }

  createform(){
    this.form.controls['user']?.setValidators([Validators.required]);
    this.form.controls['role']?.setValidators([Validators.required]);

    Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {
        // @ts-ignore
        if (this.oldUserRoleObj != undefined && control.valid){
          // @ts-ignore
          if (value === this.userRoleObj[controlName]){ control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else{ control.markAsPristine(); }
      });
    }
    this.checkButtonPrivileges();
  }

  checkButtonPrivileges() {
    this.authorizationmanger.getToken(); // Ensure user privileges are loaded
    // console.log(this.authorizationmanger.privileges)
    const userrolePrivileges = this.authorizationmanger.privileges.filter(
      // @ts-ignore
      privilege => privilege.startsWith('userrole_')
    );
    //console.log(userrolePrivileges);
    // Enable/disable buttons based on privileges
    this.enaadd = userrolePrivileges.some(privilege => privilege === 'userrole_add');
    this.enaupd = userrolePrivileges.some(privilege => privilege === 'userrole_update');
    this.enadel = userrolePrivileges.some(privilege => privilege === 'userrole_delete');
  }

  filterTable() {
    const csearchdata = this.csearch.getRawValue();

    // @ts-ignore
    this.data.filterPredicate = (daham: Userrole, filter: string)=>{
      return(csearchdata.csRole==null||daham.role.name.toLowerCase().includes(csearchdata.csRole))&&
        (csearchdata.csUser==null||daham.user.name.toLowerCase().includes(csearchdata.csUser));
    }
    this.data.filter="xx";
  }

  fillForm(daham: Userrole) {
    this.selectedRow = daham;

    this.enaadd = false;


    this.userRoleObj = JSON.parse(JSON.stringify(daham));
    this.oldUserRoleObj = JSON.parse(JSON.stringify(daham));

    // @ts-ignore
    this.userRoleObj.role = this.roles.find(role=> role.id === this.userRoleObj.role.id);
    // @ts-ignore
    this.userRoleObj.user = this.users.find(users=> users.id === this.userRoleObj.user.id);

    this.form.controls['role'].setValue(this.userRoleObj.role);
    this.form.controls['user'].setValue(this.userRoleObj.user);
    this.form.patchValue(this.userRoleObj);
    // @ts-ignore
    this.userRoleObj.role = JSON.parse(JSON.stringify(daham.role));
    this.userRoleObj.user = JSON.parse(JSON.stringify(daham.user));
    // @ts-ignore
    this.form.controls['role'].setValue(this.userRoleObj.role.id);
    this.form.controls['user'].setValue(this.userRoleObj.user.id);
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
        data: {heading: "Errors - User_vs_Role Register ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      const data = this.form.getRawValue();
      const formData = new FormData();

      formData.append('role_id', JSON.stringify(data.role));
      formData.append('user_id', JSON.stringify(data.user));

      let sbmData: string = "";
      // sbmData = sbmData + "<br>Daham_vs_Center is : "+ data.dahamschool.name +"<br> " + data.excenter.name;
      const confirm = this.matDialog.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Daham_vs_Center Add",
          message: "Are you sure to Add the folowing User_vs_Role? <br> <br>"+ sbmData}
      });
      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          this.userroleService.add(formData).then((responce: []|undefined) => {
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
              this.oldUserRoleObj = undefined;
              this.form.reset();
              Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
              this.checkButtonPrivileges();
              this.loadTable();
            }
            const stsmsg = this.matDialog.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status -User_vs_Role Registered", message: addmessage}
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
        data: {heading: "Errors - User_vs_Role Update ", message: "You have following Errors <br> " + errors}
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
            data.id = this.oldUserRoleObj?.id;

            const formData = new FormData();

            formData.append("id", data.id);
            formData.append('role_id', JSON.stringify(data.role));
            formData.append('user_id', JSON.stringify(data.user));

            this.userroleService.update(formData).then((responce: [] | undefined) => {
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
                this.oldUserRoleObj = undefined;
                this.form.reset();
                Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
                this.checkButtonPrivileges();
                this.loadTable();
              }
              const stsmsg = this.matDialog.open(MessageComponent, {
                width: '500px',
                data: {heading: "Status -User_vs_Role Update", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.matDialog.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - User_vs_Role Update", message: "Nothing Changed"}
        });
        updmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
      }
    }
  }

  delete() {
    const confirm = this.matDialog.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - User_vs_Role Delete",
        message: "Are you sure to Delete following User_vs_Role? "}
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";

        this.userroleService.delete(this.userRoleObj.id).then((responce: [] | undefined) => {
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
            this.oldUserRoleObj = undefined;
            this.form.reset();
            this.selectedRow ="";
            this.checkButtonPrivileges();
            Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
            this.loadTable();

          }
          const stsmsg = this.matDialog.open(MessageComponent, {
            width: '500px',
            data: {heading: "Status - User_vs_Role Delete ", message: delmessage}
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
        this.oldUserRoleObj =undefined;
        this.form.reset();
        this.selectedRow ="";
        this.checkButtonPrivileges();
        Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
        this.loadTable();
      }
    });
  }

}
