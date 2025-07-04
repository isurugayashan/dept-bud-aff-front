import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UiAssist} from "../../../util/ui.assist";
import {MatTableDataSource} from "@angular/material/table";
import {Excenter} from "../../../entity/excenter";
import {MatPaginator} from "@angular/material/paginator";
import {MatDialog} from "@angular/material/dialog";
import {ExcenterService} from "../../../service/excenter.service";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {Authorizationmanger} from "../../../service/authorizationmanger";
import {Dahampasal} from "../../../entity/dahampasal";
import {DahampasalService} from "../../../service/dahampasal.service";

@Component({
  selector: 'app-excenter',
  templateUrl: './excenter.component.html',
  styleUrls: ['./excenter.component.css']
})
export class ExcenterComponent {
  cols = 12;

  columns: string [] = ['id','name','edit']
  headers: string [] = ['ID','Excenter Name','Edit']
  binders: string [] = ['id','dahamschool.name','getButton()']

  cscolumns: string[] = ['csname'];
  csprompts: string[] = ['Search by Excenter-Name'];

  selectedRow: any;
  public form!: FormGroup;
  public csearch!: FormGroup;

  enaadd:boolean =false;
  enaupd:boolean =false;
  enadel:boolean =false;

  oldExcObj!: Excenter | undefined;
  excObj!: Excenter;

  excenters: Array<Excenter> = [];
  dahampasals: Array<Dahampasal> = [];
  imageurl : string = '';
  data!: MatTableDataSource<Excenter>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  uiassist : UiAssist;

  constructor(private fb: FormBuilder,
              private matDialog: MatDialog,
              private excenterService: ExcenterService,
              private authorizationmanger: Authorizationmanger,
              private dahampasalService: DahampasalService,
  ) {

    this.uiassist = new UiAssist(this);

    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    this.form= this.fb.group({
      'dahamschool_id': new FormControl('',[Validators.required]),
      'createdate': new FormControl(formattedDate),
    });

    this.csearch = this.fb.group({
      'csname': new FormControl()
    });
  }

  getButton(element:Excenter){
    return `<button>Edit</button>`;
  }

  createView() {
    this.imageurl='assets/pending.gif';
    this.loadTable();
  }

  loadTable(){
    this.excenterService.getAll()
      .then((dis: Excenter[]) => {this.excenters=dis; this.imageurl='assets/fullfilled.png';})
      .catch((error) => {
        this.matDialog.open(MessageComponent, {
          width: '500px',
          data: {heading: "Status -", message: error.error.message}
        });
        // stsmsg.afterClosed().subscribe(async result => { if (!result) { return;} }) ;} );

        this.imageurl='assets/rejected.png';})
      .finally(()=> {this.data = new MatTableDataSource(this.excenters); this.data.paginator=this.paginator;});
  }

  ngOnInit(){
    this.initialize();
    this.checkButtonPrivileges();
  }

  initialize(){
    this.createform();
    this.createView();
    this.dahampasalService.getAll().then((sbms: Dahampasal[]) =>{this.dahampasals = sbms;});
  }

  createform(){
    this.form.controls['dahamschool_id']?.setValidators([Validators.required]);

    Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {

        if (this.oldExcObj != undefined && control.valid){
          // @ts-ignore
          if (value === this.excObj[controlName]){ control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else{ control.markAsPristine(); }
      });
    }
    this.checkButtonPrivileges();
  }

  checkButtonPrivileges() {
    this.authorizationmanger.getToken(); // Ensure user privileges are loaded
    const examcenterPrivileges = this.authorizationmanger.privileges.filter(
      // @ts-ignore
      privilege => privilege.startsWith('examcenter_')
    );

    // Enable/disable buttons based on privileges
    this.enaadd = examcenterPrivileges.some(privilege => privilege === 'examcenter_add');
    this.enaupd = examcenterPrivileges.some(privilege => privilege === 'examcenter_update');
    this.enadel = examcenterPrivileges.some(privilege => privilege === 'examcenter_delete');
  }
  filterTable() {
    const csearchdata = this.csearch.getRawValue();

    // @ts-ignore
    this.data.filterPredicate = (dist: Excenter, filter: string)=>{
      return(csearchdata.csname==null||dist.dahamschool.name.toLowerCase().includes(csearchdata.csname))
    }
    this.data.filter="xx";
  }

  fillForm(excenter: Excenter) {
    this.selectedRow = excenter;
    this.enaadd = false;


    this.excObj = JSON.parse(JSON.stringify(excenter));
    this.oldExcObj = JSON.parse(JSON.stringify(excenter));

    this.form.patchValue(this.excObj);
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
        data: {heading: "Errors - Excenter Add ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      this.excObj = this.form.getRawValue();

      let disData: string = "";
      //disData = disData + "<br>Excenter_Name is : "+ this.excObj.dahamschool.name;
      const confirm = this.matDialog.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Excenter Add",
          message: "Are you sure to Add the folowing Excenter? <br> <br>"+ disData}
      });

      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){

          this.excenterService.add(this.excObj).then((responce: []|undefined) => {
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
              this.oldExcObj = undefined;
              this.form.reset();
              Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
              this.checkButtonPrivileges();
              this.loadTable();
            }
            const stsmsg = this.matDialog.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status -Excenter Add", message: addmessage}
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
        data: {heading: "Errors - Excenter Update ", message: "You have following Errors <br> " + errors}
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
            this.excObj = this.form.getRawValue();
            // @ts-ignore
            this.excObj.id = this.oldExcObj?.id;
            this.excenterService.update(this.excObj).then((responce: [] | undefined) => {
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
                this.oldExcObj = undefined;
                this.form.reset();
                Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
                this.checkButtonPrivileges();
                this.loadTable();
              }
              const stsmsg = this.matDialog.open(MessageComponent, {
                width: '500px',
                data: {heading: "Status -Excenter Name Update", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.matDialog.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Excenter Name Update", message: "Nothing Changed"}
        });
        updmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
      }
    }
  }

  delete() {
    const confirm = this.matDialog.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - Excenter Delete",
        message: "Are you sure to Delete following Excenter? <br> <br>" +
          this.excObj.dahamschool.name
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";

        this.excenterService.delete(this.excObj.id).then((responce: [] | undefined) => {
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
            this.oldExcObj = undefined;
            this.form.reset();
            this.selectedRow ="";
            this.checkButtonPrivileges();
            Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
            this.loadTable();

          }
          const stsmsg = this.matDialog.open(MessageComponent, {
            width: '500px',
            data: {heading: "Status - Excenter Delete ", message: delmessage}
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
        this.oldExcObj =undefined;
        this.form.reset();
        this.selectedRow ="";
        this.checkButtonPrivileges();
        Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
        this.loadTable();
      }
    });
  }

}
