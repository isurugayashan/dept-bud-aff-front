import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UiAssist} from "../../../util/ui.assist";
import {MatTableDataSource} from "@angular/material/table";

import {MatPaginator} from "@angular/material/paginator";
import {MatDialog} from "@angular/material/dialog";
import {PrivilegeService} from "../../../service/privilege.service";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {Privilege} from "../../../entity/privilege";
import {Authorizationmanger} from "../../../service/authorizationmanger";

@Component({
  selector: 'app-privilege',
  templateUrl: './privilege.component.html',
  styleUrls: ['./privilege.component.css']
})
export class PrivilegeComponent {
  cols = 12;

  columns: string [] = ['id','Operation','edit']
  headers: string [] = ['ID','Operation','Edit']
  binders: string [] = ['id','operation','getButton()']

  cscolumns: string[] = ['csoperation'];
  csprompts: string[] = ['Search by Privilege-Name'];

  selectedRow: any;
  public form!: FormGroup;
  public csearch!: FormGroup;

  enaadd:boolean =false;
  enaupd:boolean =false;
  enadel:boolean =false;

  oldPrivObj!: Privilege | undefined;
  privObj!: Privilege;

  privileges: Array<Privilege> = [];
  imageurl : string = '';
  data!: MatTableDataSource<Privilege>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  uiassist : UiAssist;

  constructor(private fb: FormBuilder,
              private matDialog: MatDialog,
              private privilegeService: PrivilegeService,
              private authorizationmanger: Authorizationmanger
  ) {

    this.uiassist = new UiAssist(this);

    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    this.form= this.fb.group({
      'operation': new FormControl('',[Validators.required]),
      'createdate': new FormControl(formattedDate),
    });

    this.csearch = this.fb.group({
      'csoperation': new FormControl()
    });
  }

  getButton(element:Privilege){
    return `<button>Edit</button>`;
  }

  createView() {
    this.imageurl='assets/pending.gif';
    this.loadTable();
  }

  loadTable(){
    this.privilegeService.getAll()
      .then((dis: Privilege[]) => {this.privileges=dis; this.imageurl='assets/fullfilled.png';})
      .catch((error) => {
        this.matDialog.open(MessageComponent, {
          width: '500px',
          data: {heading: "Status -", message: error.error.message}
        });
        // stsmsg.afterClosed().subscribe(async result => { if (!result) { return;} }) ;} );

        this.imageurl='assets/rejected.png';})
      .finally(()=> {this.data = new MatTableDataSource(this.privileges); this.data.paginator=this.paginator;});
  }

  ngOnInit(){
    this.initialize();
  }

  initialize(){
    this.createform();
    this.createView();
  }

  createform(){
    this.form.controls['operation']?.setValidators([Validators.required]);

    Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {

        if (this.oldPrivObj != undefined && control.valid){
          // @ts-ignore
          if (value === this.privObj[controlName]){ control.markAsPristine(); }
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
      privilege => privilege.startsWith('privilege_')
    );
    // console.log(rolePrivileges)
    // Enable/disable buttons based on privileges
    this.enaadd = rolePrivileges.some(privilege => privilege === 'privilege_add');
    this.enaupd = rolePrivileges.some(privilege => privilege === 'privilege_update');
    this.enadel = rolePrivileges.some(privilege => privilege === 'privilege_delete');
  }

  filterTable() {
    const csearchdata = this.csearch.getRawValue();

    // @ts-ignore
    this.data.filterPredicate = (dist: Privilege, filter: string)=>{
      return(csearchdata.csoperation==null||dist.operation.toLowerCase().includes(csearchdata.csoperation))
    }
    this.data.filter="xx";
  }

  fillForm(privilege: Privilege) {
    this.selectedRow = privilege;
    this.enaadd = false;

    this.privObj = JSON.parse(JSON.stringify(privilege));
    this.oldPrivObj = JSON.parse(JSON.stringify(privilege));

    this.form.patchValue(this.privObj);
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
        data: {heading: "Errors - Privilege Add ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      this.privObj = this.form.getRawValue();

      let disData: string = "";
      disData = disData + "<br>Privilege_Name is : "+ this.privObj.operation;
      const confirm = this.matDialog.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Privilege Add",
          message: "Are you sure to Add the folowing Privilege? <br> <br>"+ disData}
      });

      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){

          this.privilegeService.add(this.privObj).then((responce: []|undefined) => {
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
              console.log("undefined");
              addstatus=false;
              addmessage="Content Not Found"
            }
          }).finally( () =>{
            if(addstatus) {
              addmessage = "Successfully Saved";
              this.oldPrivObj = undefined;
              this.form.reset();
              Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
              this.checkButtonPrivileges();
              this.loadTable();
            }
            const stsmsg = this.matDialog.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status -Privilege Add", message: addmessage}
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
        data: {heading: "Errors - Privilege Update ", message: "You have following Errors <br> " + errors}
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
            this.privObj = this.form.getRawValue();

            // @ts-ignore
            this.privObj.id = this.oldPrivObj?.id;
            this.privilegeService.update(this.privObj).then((responce: [] | undefined) => {
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
            } ).finally(() => {
              if (updstatus) {
                updmessage = "Successfully Updated";
                this.oldPrivObj = undefined;
                this.form.reset();
                Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
                this.checkButtonPrivileges();
                this.loadTable();
              }
              const stsmsg = this.matDialog.open(MessageComponent, {
                width: '500px',
                data: {heading: "Status -Privilege Name Update", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.matDialog.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Privilege Name Update", message: "Nothing Changed"}
        });
        updmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
      }
    }
  }

  delete() {
    const confirm = this.matDialog.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - Privilege Delete",
        message: "Are you sure to Delete following Privilege? <br> <br>" +
          this.privObj.operation
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";

        this.privilegeService.delete(this.privObj.id).then((responce: [] | undefined) => {
          if (responce != undefined) { // @ts-ignore
            delstatus = responce['errors'] == "";
            if (!delstatus) { // @ts-ignore
              delmessage = responce['errors'];
            }
          } else {
            delstatus = false;
            delmessage = "Content Not Found"
          }
        } ).finally(() => {
          if (delstatus) {
            delmessage = "Successfully Deleted";
            this.oldPrivObj = undefined;
            this.form.reset();
            this.selectedRow ="";
            this.checkButtonPrivileges();
            Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
            this.loadTable();

          }
          const stsmsg = this.matDialog.open(MessageComponent, {
            width: '500px',
            data: {heading: "Status - Privilege Delete ", message: delmessage}
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
        this.oldPrivObj =undefined;
        this.form.reset();
        this.selectedRow ="";
        this.checkButtonPrivileges();
        Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
        this.loadTable();
      }
    });
  }

}
