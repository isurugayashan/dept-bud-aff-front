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
import {Authorizationmanger} from "../../../service/authorizationmanger";
import {Teacher} from "../../../entity/teacher";

@Component({
  selector: 'app-sbm',
  templateUrl: './sbm.component.html',
  styleUrls: ['./sbm.component.css']
})
export class SbmComponent {
  cols = 12;

  columns: string [] = ['name','district','edit']
  headers: string [] = ['SBM Name','District Name','Edit']
  binders: string [] = ['name','district.name','getButton()']

  cscolumns: string[] = ['csname','csdistrict'];
  csprompts: string[] = ['Search by SBM','Search by District-Name'];

  selectedRow: any;
  public form!: FormGroup;
  public csearch!: FormGroup;

  enaadd:boolean =false;
  enaupd:boolean =false;
  enadel:boolean =false;

  oldsbmObj!: Sbm | undefined;
  sbmObj!: Sbm;

  districts: Array<District> = [];
  sbms: Array<Sbm> = [];
  imageurl : string = '';
  data!: MatTableDataSource<Sbm>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private readonly localStorageSBM = 'sbm';
  uiassist : UiAssist;

  constructor(private fb: FormBuilder,
              private matDialog: MatDialog,
              private districtService: DistrictService,
              private sbmService: SbmService,
              private authorizationmanger: Authorizationmanger
  ) {

    this.uiassist = new UiAssist(this);

    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    this.form= this.fb.group({
      'name': new FormControl('',[Validators.required]),
      'district': new FormControl('',[Validators.required]),
      'createdate': new FormControl(formattedDate),
    });

    this.csearch = this.fb.group({
      'csname': new FormControl(),
      'csdistrict': new FormControl()
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
    const Sbms = JSON.parse(localStorage.getItem(this.localStorageSBM));
    // @ts-ignore
    if (Sbms && Sbms.length > 0) {
      // @ts-ignore
      this.sbms = Sbms;
      this.imageurl = 'assets/fullfilled.png';
      this.data = new MatTableDataSource(this.sbms);
      this.data.paginator = this.paginator;
    } else {
      this.sbmService.getAll()
        .then((sbm: Sbm[]) => {this.sbms=sbm; this.imageurl='assets/fullfilled.png';})
        .catch((error) => {
          this.matDialog.open(MessageComponent, {
            width: '500px',
            data: {heading: "Status -", message: error.error.message}
          });
          this.imageurl='assets/rejected.png';})
        .finally(()=> {this.data = new MatTableDataSource(this.sbms); this.data.paginator=this.paginator;});
    }
  }

  ngOnInit(){
    this.initialize();
    this.checkButtonPrivileges();
  }

  initialize(){
    this.createform();
    this.createView();

    this.districtService.getAll().then((dists: District[]) =>{this.districts = dists;});

  }

  createform(){
    this.form.controls['name']?.setValidators([Validators.required]);
    this.form.controls['district']?.setValidators([Validators.required]);

    Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {

        if (this.oldsbmObj != undefined && control.valid){
          // @ts-ignore
          if (value === this.sbmObj[controlName]){ control.markAsPristine(); }
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
    const sbmPrivileges = this.authorizationmanger.privileges.filter(
      // @ts-ignore
      privilege => privilege.startsWith('sbm_')
    );

    // Enable/disable buttons based on privileges
    this.enaadd = sbmPrivileges.some(privilege => privilege === 'sbm_add');
    this.enaupd = sbmPrivileges.some(privilege => privilege === 'sbm_update');
    this.enadel = sbmPrivileges.some(privilege => privilege === 'sbm_delete');
  }

  filterTable() {
    const csearchdata = this.csearch.getRawValue();

    // @ts-ignore
    this.data.filterPredicate = (sbm: Sbm, filter: string)=>{
      return(csearchdata.csname==null||sbm.name.toLowerCase().includes(csearchdata.csname))&&
      (csearchdata.csdistrict==null||sbm.district.name.toLowerCase().includes(csearchdata.csdistrict));
    }
    this.data.filter="xx";
  }

  fillForm(sbm: Sbm) {
    this.selectedRow = sbm;
    this.enaadd = false;


    this.sbmObj = JSON.parse(JSON.stringify(sbm));
    this.oldsbmObj = JSON.parse(JSON.stringify(sbm));

    // @ts-ignore
    this.sbmObj.district = this.districts.find(dist=> dist.id === this.sbmObj.district.id);

    this.form.controls['district'].setValue(this.sbmObj.district);
    this.form.patchValue(this.sbmObj);
    // @ts-ignore
    this.sbmObj.district = JSON.parse(JSON.stringify(sbm.district));
    // @ts-ignore
    this.form.controls['district'].setValue(this.sbmObj.district.id);
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
        data: {heading: "Errors - SBM Add ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      const data = this.form.getRawValue();
      console.log(data);
      const formData = new FormData();

      formData.append('name', data.name);
      formData.append('districts_id', JSON.stringify(data.district));

      let sbmData: string = "";
      sbmData = sbmData + "<br>SBM_Name is : "+ data.name;
      const confirm = this.matDialog.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - SBM Add",
          message: "Are you sure to Add the folowing SBM? <br> <br>"+ sbmData}
      });

      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){

          this.sbmService.add(formData).then((responce: []|undefined) => {
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
              this.oldsbmObj = undefined;
              this.form.reset();
              Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
              this.checkButtonPrivileges();
              this.loadTable();
            }
            const stsmsg = this.matDialog.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status -SBM Add", message: addmessage}
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
        data: {heading: "Errors - SBM Update ", message: "You have following Errors <br> " + errors}
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
            console.log(data)
            // @ts-ignore
            data.id = this.oldsbmObj?.id;
            const formData = new FormData();

            formData.append("id", data.id);
            formData.append('name', data.name);
            formData.append('districts_id', JSON.stringify(data.district));

            this.sbmService.update(formData).then((responce: [] | undefined) => {
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
                this.oldsbmObj = undefined;
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
          this.sbmObj.name
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";

        this.sbmService.delete(this.sbmObj.id).then((responce: [] | undefined) => {
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
            this.oldsbmObj = undefined;
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
        this.oldsbmObj =undefined;
        this.form.reset();
        this.selectedRow ="";
        this.checkButtonPrivileges();
        Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
        this.loadTable();
      }
    });
  }

}


// isSmallScreen = this.breakpointObserver.isMatched('(min-width: 800px)');
//
// constructor(private breakpointObserver: BreakpointObserver) {
//   // Subscribe to changes in screen size
//   this.breakpointObserver.observe(['(min-width: 800px)'])
//     .subscribe(result => {
//       this.isSmallScreen = result.matches;
//       // Update the number of columns based on screen size
//       this.cols = this.isSmallScreen ? 12 : 8;
//     });
// }
