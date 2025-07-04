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
import {Authorizationmanger} from "../../../service/authorizationmanger";

@Component({
  selector: 'app-district',
  templateUrl: './district.component.html',
  styleUrls: ['./district.component.css']
})
export class DistrictComponent {
  cols = 12;

  columns: string [] = ['id','name','edit']
  headers: string [] = ['ID','District Name','Edit']
  binders: string [] = ['id','name','getButton()']

  cscolumns: string[] = ['csname'];
  csprompts: string[] = ['Search by District-Name'];

  selectedRow: any;
  public form!: FormGroup;
  public csearch!: FormGroup;

  enaadd:boolean =false;
  enaupd:boolean =false;
  enadel:boolean =false;

  oldDisObj!: District | undefined;
  disObj!: District;

  districts: Array<District> = [];
  imageurl : string = '';
  data!: MatTableDataSource<District>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  uiassist : UiAssist;

  constructor(private fb: FormBuilder,
              private matDialog: MatDialog,
              private districtService: DistrictService,
              private authorizationmanger: Authorizationmanger
  ) {

    this.uiassist = new UiAssist(this);

    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    this.form= this.fb.group({
      'name': new FormControl('',[Validators.required]),
      'createdate': new FormControl(formattedDate),
    });

    this.csearch = this.fb.group({
      'csname': new FormControl()
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
    this.districtService.getAll()
      .then((dis: District[]) => {this.districts=dis; this.imageurl='assets/fullfilled.png';})
      .catch((error) => {
        this.matDialog.open(MessageComponent, {
          width: '500px',
          data: {heading: "Status -", message: error.error.message}
        });
        // stsmsg.afterClosed().subscribe(async result => { if (!result) { return;} }) ;} );

        this.imageurl='assets/rejected.png';})
      .finally(()=> {this.data = new MatTableDataSource(this.districts); this.data.paginator=this.paginator;});

  }

  ngOnInit(){
    this.initialize();
    this.checkButtonPrivileges();
  }

  initialize(){
  this.createform();
  this.createView();
  }

  createform(){
    this.form.controls['name']?.setValidators([Validators.required]);

    Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {

        if (this.oldDisObj != undefined && control.valid){
          // @ts-ignore
          if (value === this.disObj[controlName]){ control.markAsPristine(); }
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
    const districtPrivileges = this.authorizationmanger.privileges.filter(
      // @ts-ignore
      privilege => privilege.startsWith('district_')
    );
    // Enable/disable buttons based on privileges
    this.enaadd = districtPrivileges.some(privilege => privilege === 'district_add');
    this.enaupd = districtPrivileges.some(privilege => privilege === 'district_update');
    this.enadel = districtPrivileges.some(privilege => privilege === 'district_delete');
  }

  filterTable() {
    const csearchdata = this.csearch.getRawValue();

    // @ts-ignore
    this.data.filterPredicate = (dist: District, filter: string)=>{
      return(csearchdata.csname==null||dist.name.toLowerCase().includes(csearchdata.csname))
    }
    this.data.filter="xx";
  }

  fillForm(district: District) {
    this.selectedRow = district;

    this.enaadd = false;

    this.disObj = JSON.parse(JSON.stringify(district));
    this.oldDisObj = JSON.parse(JSON.stringify(district));

    this.form.patchValue(this.disObj);
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
        data: {heading: "Errors - District Add ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      this.disObj = this.form.getRawValue();

      let disData: string = "";
      disData = disData + "<br>District_Name is : "+ this.disObj.name;
      const confirm = this.matDialog.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - District Add",
          message: "Are you sure to Add the folowing District? <br> <br>"+ disData}
      });

      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){

          this.districtService.add(this.disObj).then((responce: []|undefined) => {
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
              this.oldDisObj = undefined;
              this.form.reset();
              Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
              this.checkButtonPrivileges();
              this.loadTable();
            }
            const stsmsg = this.matDialog.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status -District Add", message: addmessage}
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
        data: {heading: "Errors - District Update ", message: "You have following Errors <br> " + errors}
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
            this.disObj = this.form.getRawValue();

            // @ts-ignore
            this.disObj.id = this.oldDisObj?.id;
            this.districtService.update(this.disObj).then((responce: [] | undefined) => {
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
                this.oldDisObj = undefined;
                this.form.reset();
                Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
                this.checkButtonPrivileges();
                this.loadTable();
              }
              const stsmsg = this.matDialog.open(MessageComponent, {
                width: '500px',
                data: {heading: "Status -District Name Update", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.matDialog.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - District Name Update", message: "Nothing Changed"}
        });
        updmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
      }
    }
  }

  delete() {
    const confirm = this.matDialog.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - District Delete",
        message: "Are you sure to Delete following District? <br> <br>" +
          this.disObj.name
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";

        this.districtService.delete(this.disObj.id).then((responce: [] | undefined) => {
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
            this.oldDisObj = undefined;
            this.form.reset();
            this.selectedRow ="";
            this.checkButtonPrivileges();
            Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
            this.loadTable();

          }
          const stsmsg = this.matDialog.open(MessageComponent, {
            width: '500px',
            data: {heading: "Status - District Delete ", message: delmessage}
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
        this.oldDisObj =undefined;
        this.form.reset();
        this.selectedRow ="";
       //this.enaleButtons(true,false,false);
        Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
        this.loadTable();
        this.checkButtonPrivileges()
      }
    });
  }

}
