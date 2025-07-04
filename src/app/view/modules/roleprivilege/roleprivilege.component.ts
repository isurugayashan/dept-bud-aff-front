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
import {Authorizationmanger} from "../../../service/authorizationmanger";

@Component({
  selector: 'app-roleprivilege',
  templateUrl: './roleprivilege.component.html',
  styleUrls: ['./roleprivilege.component.css']
})
export class RoleprivilegeComponent {
  cols = 12;

  columns: string [] = ['role','privilege','edit']
  headers: string [] = ['Role Name','Operation','Edit']
  binders: string [] = ['role.name','privilege.operation','getButton()']

  cscolumns: string[] = ['csrole','csprivilege'];
  csprompts: string[] = ['Search by Role','Search by Operation'];

  selectedRow: any;
  public form!: FormGroup;
  public csearch!: FormGroup;

  enaadd:boolean =false;
  enaupd:boolean =false;
  enadel:boolean =false;

  oldRolePrivObj!: Rolepriv | undefined;
  rolePrivObj!: Rolepriv;

  roles: Array<Role> = [];
  privileges: Array<Privilege> = [];
  roleprivileges: Array<Rolepriv> = [];
  imageurl : string = '';
  data!: MatTableDataSource<Rolepriv>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  uiassist : UiAssist;

  constructor(private fb: FormBuilder,
              private matDialog: MatDialog,
              private roleprivService: RoleprivService,
              private roleService: RoleService,
              private privilegeService: PrivilegeService,
              private dp: DatePipe,
              private authorizationmanger: Authorizationmanger
  ) {

    this.uiassist = new UiAssist(this);

    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    this.form= this.fb.group({
      'role': new FormControl('',[Validators.required]),
      'privilege': new FormControl('',[Validators.required]),
      'createdate': new FormControl(formattedDate),
    });

    this.csearch = this.fb.group({
      'csrole': new FormControl(),
      'csprivilege': new FormControl(),
    });
  }

  getButton(element:Rolepriv){
    return `<button>Edit</button>`;
  }

  createView() {
    this.imageurl='assets/pending.gif';
    this.loadTable();
  }

  loadTable(){
    this.roleprivService.getAll()
      .then((daham: Rolepriv[]) => {this.roleprivileges=daham; this.imageurl='assets/fullfilled.png';})
      .catch((error) => {
        this.matDialog.open(MessageComponent, {
          width: '500px',
          data: {heading: "Status -", message: error.error.message}
        });
        // stsmsg.afterClosed().subscribe(async result => { if (!result) { return;} }) ;} );

        this.imageurl='assets/rejected.png';})
      .finally(()=> {this.data = new MatTableDataSource(this.roleprivileges); this.data.paginator=this.paginator;});
  }

  ngOnInit(){
    this.initialize();
    this.checkButtonPrivileges();
  }

  initialize(){
    this.createform();
    this.createView();

    this.roleService.getAll().then((sbms: Role[]) =>{this.roles = sbms;});

    this.privilegeService.getAll().then((sbms: Privilege[]) =>{this.privileges = sbms;});

  }

  createform(){
    this.form.controls['privilege']?.setValidators([Validators.required]);
    this.form.controls['role']?.setValidators([Validators.required]);

    Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});

    //this.enaleButtons(true, false, false);

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {
        // @ts-ignore
        if (this.oldRolePrivObj != undefined && control.valid){
          // @ts-ignore
          if (value === this.rolePrivObj[controlName]){ control.markAsPristine(); }
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
    const rolePrivileges = this.authorizationmanger.privileges.filter(
      // @ts-ignore
      privilege => privilege.startsWith('roleprivilege_')
    );

    // Enable/disable buttons based on privileges
    this.enaadd = rolePrivileges.some(privilege => privilege === 'roleprivilege_add');
    this.enaupd = rolePrivileges.some(privilege => privilege === 'roleprivilege_update');
    this.enadel = rolePrivileges.some(privilege => privilege === 'roleprivilege_delete');
  }
  filterTable() {
    const csearchdata = this.csearch.getRawValue();

    // @ts-ignore
    this.data.filterPredicate = (daham: Rolepriv, filter: string)=>{
      return(csearchdata.csrole==null||daham.role.name.toLowerCase().includes(csearchdata.csrole))&&
        (csearchdata.csprivilege==null||daham.privilege.operation.toLowerCase().includes(csearchdata.csprivilege));
    }
    this.data.filter="xx";
  }

  fillForm(daham: Rolepriv) {
    this.selectedRow = daham;
    this.enaadd = false;


    this.rolePrivObj = JSON.parse(JSON.stringify(daham));
    this.oldRolePrivObj = JSON.parse(JSON.stringify(daham));

    // @ts-ignore
    this.rolePrivObj.role = this.roles.find(role=> role.id === this.rolePrivObj.role.id);
    // @ts-ignore
    this.rolePrivObj.privilege = this.privileges.find(privilege=> privilege.id === this.rolePrivObj.privilege.id);

    this.form.controls['role'].setValue(this.rolePrivObj.role);
    this.form.controls['privilege'].setValue(this.rolePrivObj.privilege);
    this.form.patchValue(this.rolePrivObj);
    // @ts-ignore
    this.rolePrivObj.role = JSON.parse(JSON.stringify(daham.role));
    this.rolePrivObj.privilege = JSON.parse(JSON.stringify(daham.privilege));
    // @ts-ignore
    this.form.controls['role'].setValue(this.rolePrivObj.role.id);
    this.form.controls['privilege'].setValue(this.rolePrivObj.privilege.id);
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
        data: {heading: "Errors - Role_vs_Privilege Register ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      const data = this.form.getRawValue();
      console.log(data);
      const formData = new FormData();

      formData.append('role_id', JSON.stringify(data.role));
      formData.append('privilege_id', JSON.stringify(data.privilege));

      let sbmData: string = "";
      // sbmData = sbmData + "<br>Daham_vs_Center is : "+ data.dahamschool.name +"<br> " + data.excenter.name;
      const confirm = this.matDialog.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Role_vs_Privilege Add",
          message: "Are you sure to Add the folowing Role_vs_Privilege? <br> <br>"+ sbmData}
      });
      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          this.roleprivService.add(formData).then((responce: []|undefined) => {
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
              this.oldRolePrivObj = undefined;
              this.form.reset();
              Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
              this.checkButtonPrivileges();
              this.loadTable();
            }
            const stsmsg = this.matDialog.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status -Role_vs_Privilege Registerd", message: addmessage}
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
        data: {heading: "Errors - Role_vs_Privilege Update ", message: "You have following Errors <br> " + errors}
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
            data.id = this.oldRolePrivObj?.id;

            const formData = new FormData();

            formData.append("id", data.id);
            formData.append('role_id', JSON.stringify(data.role));
            formData.append('privilege_id', JSON.stringify(data.privilege));

            this.roleprivService.update(formData).then((responce: [] | undefined) => {
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
                this.oldRolePrivObj = undefined;
                this.form.reset();
                Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
                this.checkButtonPrivileges();
                this.loadTable();
              }
              const stsmsg = this.matDialog.open(MessageComponent, {
                width: '500px',
                data: {heading: "Status -Role_vs_Privilege Update", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.matDialog.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Role_vs_Privilege Update", message: "Nothing Changed"}
        });
        updmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
      }
    }
  }

  delete() {
    const confirm = this.matDialog.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - Role_vs_Privilege Delete",
        message: "Are you sure to Delete following Role_vs_Privilege? "}
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";

        this.roleprivService.delete(this.rolePrivObj.id).then((responce: [] | undefined) => {
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
            this.oldRolePrivObj = undefined;
            this.form.reset();
            this.selectedRow ="";
            this.checkButtonPrivileges();
            Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
            this.loadTable();

          }
          const stsmsg = this.matDialog.open(MessageComponent, {
            width: '500px',
            data: {heading: "Status - Role_vs_Privilege Delete ", message: delmessage}
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
        this.oldRolePrivObj =undefined;
        this.form.reset();
        this.selectedRow ="";
        this.checkButtonPrivileges();
        Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
        this.loadTable();
      }
    });
  }

}
