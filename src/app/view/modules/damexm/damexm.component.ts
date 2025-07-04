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
import {Authorizationmanger} from "../../../service/authorizationmanger";

@Component({
  selector: 'app-damexm',
  templateUrl: './damexm.component.html',
  styleUrls: ['./damexm.component.css']
})
export class DamexmComponent {
  cols = 12;

  columns: string [] = ['daham','excenter','year','edit']
  headers: string [] = ['Daham Pasala Name','Exam Center','Year','Edit']
  binders: string [] = ['dahamschool.name','excenter.dahamschool.name','getMody()','getButton()']

  cscolumns: string[] = ['csdaham','csexcenter'];
  csprompts: string[] = ['Search by Daham Pasala','Search by Exam Center'];

  selectedRow: any;
  public form!: FormGroup;
  public csearch!: FormGroup;

  enaadd:boolean =false;
  enaupd:boolean =false;
  enadel:boolean =false;

  oldDamexamObj!: Damexam | undefined;
  damexamObj!: Damexam;

  excenters: Array<Excenter> = [];
  dahampasals: Array<Dahampasal> = [];
  damexams: Array<Damexam> = [];
  imageurl : string = '';
  data!: MatTableDataSource<Damexam>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  uiassist : UiAssist;

  constructor(private fb: FormBuilder,
              private matDialog: MatDialog,
              private excenterService: ExcenterService,
              private dahampasalService: DahampasalService,
              private damexamService: DamexamService,
              private dp: DatePipe,
              private authorizationmanger: Authorizationmanger
  ) {

    this.uiassist = new UiAssist(this);

    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    this.form= this.fb.group({
      'dahamschool': new FormControl('',[Validators.required]),
      'year': new FormControl('',[Validators.required]),
      'excenter': new FormControl('',[Validators.required]),
      'createdate': new FormControl(formattedDate),
    });

    this.csearch = this.fb.group({
      'csdaham': new FormControl(),
      'csexcenter': new FormControl(),
    });
  }

  getButton(element:Damexam){
    return `<button>Edit</button>`;
  }

  getMody(element:Damexam){
    return element.year.split('T')[0];

  }

  createView() {
    this.imageurl='assets/pending.gif';
    this.loadTable();
  }

  loadTable(){
    this.damexamService.getAll()
      .then((daham: Damexam[]) => {this.damexams=daham;this.imageurl='assets/fullfilled.png';})
      .catch((error) => {
        this.matDialog.open(MessageComponent, {
          width: '500px',
          data: {heading: "Status -", message: error.error.message}
        });
        // stsmsg.afterClosed().subscribe(async result => { if (!result) { return;} }) ;} );

        this.imageurl='assets/rejected.png';})
      .finally(()=> {this.data = new MatTableDataSource(this.damexams); this.data.paginator=this.paginator;});
  }

  ngOnInit(){
    this.initialize();
    this.checkButtonPrivileges();
  }

  initialize(){
    this.createform();
    this.createView();

    this.excenterService.getAll().then((sbms: Excenter[]) =>{this.excenters = sbms;});

    this.dahampasalService.getAll().then((sbms: Dahampasal[]) =>{this.dahampasals = sbms;});

  }

  createform(){
    this.form.controls['dahamschool']?.setValidators([Validators.required]);
    this.form.controls['year']?.setValidators([Validators.required]);
    this.form.controls['excenter']?.setValidators([Validators.required]);

    Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});

   // this.enaleButtons(true, false, false);

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {
        // @ts-ignore
        if(controlName=="year")
          value = this.dp.transform(new Date(value), 'yyyy-MM-dd');

        if (this.oldDamexamObj != undefined && control.valid){
          // @ts-ignore
          if (value === this.damexamObj[controlName]){ control.markAsPristine(); }
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
    const dahamExamPrivileges = this.authorizationmanger.privileges.filter(
      // @ts-ignore
      privilege => privilege.startsWith('dahamexam_')
    );
    // console.log(districtPrivileges)
    // Enable/disable buttons based on privileges
    this.enaadd = dahamExamPrivileges.some(privilege => privilege === 'dahamexam_add');
    this.enaupd = dahamExamPrivileges.some(privilege => privilege === 'dahamexam_update');
    this.enadel = dahamExamPrivileges.some(privilege => privilege === 'dahamexam_delete');
  }

  filterTable() {
    const csearchdata = this.csearch.getRawValue();

    // @ts-ignore
    this.data.filterPredicate = (daham: Damexam, filter: string)=>{
      return(csearchdata.csdaham==null||daham.dahamschool.name.toLowerCase().includes(csearchdata.csdaham))&&
        (csearchdata.csexcenter==null||daham.excenter.dahamschool.name.toLowerCase().includes(csearchdata.csexcenter));
    }
    this.data.filter="xx";
  }

  fillForm(daham: Damexam) {
    this.selectedRow = daham;
    this.enaadd = false;


    this.damexamObj = JSON.parse(JSON.stringify(daham));
    this.oldDamexamObj = JSON.parse(JSON.stringify(daham));

    // @ts-ignore
    this.damexamObj.dahamschool = this.dahampasals.find(dahams=> dahams.id === this.damexamObj.dahamschool.id);
    // @ts-ignore
    this.damexamObj.excenter = this.excenters.find(exenter=> exenter.id === this.damexamObj.excenter.id);

    this.form.controls['dahamschool'].setValue(this.damexamObj.dahamschool);
    this.form.controls['excenter'].setValue(this.damexamObj.excenter);
    this.form.patchValue(this.damexamObj);
    // @ts-ignore
    this.damexamObj.dahamschool = JSON.parse(JSON.stringify(daham.dahamschool));
    this.damexamObj.excenter = JSON.parse(JSON.stringify(daham.excenter));
    // @ts-ignore
    this.form.controls['dahamschool'].setValue(this.damexamObj.dahamschool.id);
    this.form.controls['excenter'].setValue(this.damexamObj.excenter.id);
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
        data: {heading: "Errors - Daham_vs_Center Register ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      const data = this.form.getRawValue();
      const formData = new FormData();

      // @ts-ignore
      formData.append('year', this.dp.transform(new Date(data.year), 'yyyy-MM-dd'));
      formData.append('dahamschool_id', JSON.stringify(data.dahamschool));
      formData.append('excenter_id', JSON.stringify(data.excenter));

      let sbmData: string = "";
      // sbmData = sbmData + "<br>Daham_vs_Center is : "+ data.dahamschool.name +"<br> " + data.excenter.name;
      const confirm = this.matDialog.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Daham_vs_Center Add",
          message: "Are you sure to Add the folowing Daham_vs_Center? <br> <br>"+ sbmData}
      });
      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          this.damexamService.add(formData).then((responce: []|undefined) => {
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
              this.oldDamexamObj = undefined;
              this.form.reset();
              Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
              this.checkButtonPrivileges();
              this.loadTable();
            }
            const stsmsg = this.matDialog.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status -Daham_vs_Center Registerd", message: addmessage}
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
        data: {heading: "Errors - Daham_vs_Center Update ", message: "You have following Errors <br> " + errors}
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
            data.id = this.oldDamexamObj?.id;

            const formData = new FormData();

            formData.append("id", data.id);
            // @ts-ignore
            formData.append('year', this.dp.transform(new Date(data.year), 'yyyy-MM-dd'));
            formData.append('dahamschool_id', JSON.stringify(data.dahamschool));
            formData.append('excenter_id', JSON.stringify(data.excenter));

            this.damexamService.update(formData).then((responce: [] | undefined) => {
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
                this.oldDamexamObj = undefined;
                this.form.reset();
                Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
                this.checkButtonPrivileges();
                this.loadTable();
              }
              const stsmsg = this.matDialog.open(MessageComponent, {
                width: '500px',
                data: {heading: "Status -Daham_vs_Center Update", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.matDialog.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Daham_vs_Center Update", message: "Nothing Changed"}
        });
        updmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
      }
    }
  }

  delete() {
    const confirm = this.matDialog.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - Daham_vs_Center Delete",
        message: "Are you sure to Delete following Daham_vs_Center? "}
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";

        this.damexamService.delete(this.damexamObj.id).then((responce: [] | undefined) => {
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
            this.oldDamexamObj = undefined;
            this.form.reset();
            this.selectedRow ="";
            this.checkButtonPrivileges();
            Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
            this.loadTable();

          }
          const stsmsg = this.matDialog.open(MessageComponent, {
            width: '500px',
            data: {heading: "Status - Daham_vs_Center Delete ", message: delmessage}
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
        this.oldDamexamObj =undefined;
        this.form.reset();
        this.selectedRow ="";
        this.checkButtonPrivileges();
        Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
        this.loadTable();
      }
    });
  }

}
