
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
import {Authorizationmanger} from "../../../service/authorizationmanger";
import {Teacher} from "../../../entity/teacher";

@Component({
  selector: 'app-dahampasal',
  templateUrl: './dahampasal.component.html',
  styleUrls: ['./dahampasal.component.css']
})
export class DahampasalComponent {
  cols = 12;

  columns: string [] = ['name','regno','sbm','phone','address','edit']
  headers: string [] = ['Daham Pasala Name','Register Number',' SBM-Name','Phone Number','Address','Edit']
  binders: string [] = ['name','regno','sbm.name','phone','address','getButton()']

  cscolumns: string[] = ['csname','csregno','csSbm'];
  csprompts: string[] = ['Search by name','Search by reg_num','Search by SBM'];

  selectedRow: any;
  public form!: FormGroup;
  public csearch!: FormGroup;

  enaadd:boolean =false;
  enaupd:boolean =false;
  enadel:boolean =false;

  oldDahamObj!: Dahampasal | undefined;
  dahamObj!: Dahampasal;

  sbms: Array<Sbm> = [];
  dahampasals: Array<Dahampasal> = [];
  imageurl : string = '';
  data!: MatTableDataSource<Dahampasal>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private readonly localStorageDahampasal = 'dahamschool';

  uiassist : UiAssist;

  constructor(private fb: FormBuilder,
              private matDialog: MatDialog,
              private districtService: DistrictService,
              private sbmService: SbmService,
              private dahampasalService: DahampasalService,
              private authorizationmanger: Authorizationmanger
  ) {

    this.uiassist = new UiAssist(this);

    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    this.form= this.fb.group({
      'name': new FormControl('',[Validators.required]),
      'regno': new FormControl('',[Validators.required]),
      'sbm': new FormControl('',[Validators.required]),
      'phone': new FormControl('',[Validators.required,Validators.pattern('^[0-9]{10}$')]),
      'address': new FormControl('',[Validators.required]),
      'createdate': new FormControl(formattedDate),
    });

    this.csearch = this.fb.group({
      'csname': new FormControl(),
      'csregno': new FormControl(),
      'csSbm': new FormControl()
    });
  }

  getButton(element:District){
    return `<button>Edit</button>`;
  }

  createView() {
    this.imageurl='assets/pending.gif';
    this.loadTable();
  }

  loadTable() {
    // @ts-ignore
    const Dahampasals = JSON.parse(localStorage.getItem(this.localStorageDahampasal));

    // @ts-ignore
    if (Dahampasals && Dahampasals.length > 0) {
      // @ts-ignore
      this.dahampasals = Dahampasals;
      this.imageurl = 'assets/fullfilled.png';
      this.data = new MatTableDataSource(this.dahampasals);
      this.data.paginator = this.paginator;
    } else {
      this.dahampasalService.getAll()
        .then((daham: Dahampasal[]) => {this.dahampasals=daham; this.imageurl='assets/fullfilled.png';})
        .catch((error) => {
          this.matDialog.open(MessageComponent, {
            width: '500px',
            data: {heading: "Status -", message: error.error.message}
          });
          // stsmsg.afterClosed().subscribe(async result => { if (!result) { return;} }) ;} );

          this.imageurl='assets/rejected.png';})
        .finally(()=> {this.data = new MatTableDataSource(this.dahampasals); this.data.paginator=this.paginator;});
    }
  }

  ngOnInit(){
    this.initialize();
    this.checkButtonPrivileges();
  }

  initialize(){
    this.createform();
    this.createView();

    this.sbmService.getAll().then((sbms: Sbm[]) =>{this.sbms = sbms;});

  }

  createform(){
    this.form.controls['name']?.setValidators([Validators.required]);
    this.form.controls['district']?.setValidators([Validators.required]);
    this.form.controls['sbm']?.setValidators([Validators.required]);
    this.form.controls['address']?.setValidators([Validators.required]);
    this.form.controls['phone']?.setValidators([Validators.required,Validators.pattern('^[0-9]{10}$')]);

    Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {

        if (this.oldDahamObj != undefined && control.valid){
          // @ts-ignore
          if (value === this.dahamObj[controlName]){ control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else{ control.markAsPristine(); }
      });
    }
    this.checkButtonPrivileges();
  }

  checkButtonPrivileges() {
    this.authorizationmanger.getToken(); // Ensure user privileges are loaded
    const studentPrivileges = this.authorizationmanger.privileges.filter(
      // @ts-ignore
      privilege => privilege.startsWith('dahampasala_')
    );
    // Enable/disable buttons based on privileges
    this.enaadd = studentPrivileges.some(privilege => privilege === 'dahampasala_add');
    this.enaupd = studentPrivileges.some(privilege => privilege === 'dahampasala_update');
    this.enadel = studentPrivileges.some(privilege => privilege === 'dahampasala_delete');
  }

  filterTable() {
    const csearchdata = this.csearch.getRawValue();

    // @ts-ignore
    this.data.filterPredicate = (daham: Dahampasal, filter: string)=>{
      return(csearchdata.csname==null||daham.name.toLowerCase().includes(csearchdata.csname))&&
        (csearchdata.csregno==null||daham.regno.toLowerCase().includes(csearchdata.csregno))&&
        (csearchdata.csSbm==null||daham.sbm.name.toLowerCase().includes(csearchdata.csSbm));
    }
    this.data.filter="xx";
  }

  fillForm(daham: Dahampasal) {
    this.selectedRow = daham;
    this.enaadd = false;


    this.dahamObj = JSON.parse(JSON.stringify(daham));
    this.oldDahamObj = JSON.parse(JSON.stringify(daham));

    // @ts-ignore
    this.dahamObj.sbm = this.dahampasals.find(dahams=> dahams.id === this.dahamObj.sbm.id);

    this.form.controls['sbm'].setValue(this.dahamObj.sbm);
    this.form.patchValue(this.dahamObj);
    // @ts-ignore
    this.dahamObj.sbm = JSON.parse(JSON.stringify(daham.sbm));
    // @ts-ignore
    this.form.controls['sbm'].setValue(this.dahamObj.sbm.id);
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
        data: {heading: "Errors - Daham Pasala Register ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      const data = this.form.getRawValue();
      console.log(data);

        const formData = new FormData();

        formData.append('name', data.name);
        formData.append('regno', data.regno);
        formData.append('address', data.address);
        formData.append('phone', data.phone);
        formData.append('sbm_id', JSON.stringify(data.sbm));

      let sbmData: string = "";
      sbmData = sbmData + "<br>Daham Pasal_Name is : "+ data.name;
      const confirm = this.matDialog.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - SBM Add",
          message: "Are you sure to Add the folowing Daham pasala? <br> <br>"+ sbmData}
      });
      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          this.dahampasalService.add(formData).then((responce: []|undefined) => {
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
              this.oldDahamObj = undefined;
              this.form.reset();
              Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
              this.checkButtonPrivileges();
              this.loadTable();
            }
            const stsmsg = this.matDialog.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status -Daham Pasala Registerd", message: addmessage}
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
        data: {heading: "Errors - Daham Pasala Update ", message: "You have following Errors <br> " + errors}
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
            data.id = this.oldDahamObj?.id;

            const formData = new FormData();

            formData.append("id", data.id);
            formData.append('name', data.name);
            formData.append('regno', data.regno);
            formData.append('address', data.address);
            formData.append('phone', data.phone);
            formData.append('sbm_id', JSON.stringify(data.sbm));

            this.dahampasalService.update(formData).then((responce: [] | undefined) => {
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
                this.oldDahamObj = undefined;
                this.form.reset();
                Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
                this.checkButtonPrivileges();
                this.loadTable();
              }
              const stsmsg = this.matDialog.open(MessageComponent, {
                width: '500px',
                data: {heading: "Status -SBM Update", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.matDialog.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - SBM Update", message: "Nothing Changed"}
        });
        updmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
      }
    }
  }

  delete() {
    const confirm = this.matDialog.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - SBM Delete",
        message: "Are you sure to Delete following SBM? <br> <br>" +
          this.dahamObj.name
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";

        this.dahampasalService.delete(this.dahamObj.id).then((responce: [] | undefined) => {
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
            this.oldDahamObj = undefined;
            this.form.reset();
            this.selectedRow ="";
            this.checkButtonPrivileges();
            Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
            this.loadTable();

          }
          const stsmsg = this.matDialog.open(MessageComponent, {
            width: '500px',
            data: {heading: "Status - SBM Delete ", message: delmessage}
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
        this.oldDahamObj =undefined;
        this.form.reset();
        this.selectedRow ="";
        this.checkButtonPrivileges();
        Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
        this.loadTable();
      }
    });
  }

}
