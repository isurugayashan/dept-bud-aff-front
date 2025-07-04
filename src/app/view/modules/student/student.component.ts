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
import {Damexam} from "../../../entity/damexam";
import {Student} from "../../../entity/student";
import {Grade} from "../../../entity/grade";
import {GradeService} from "../../../service/grade.service";
import {StudentService} from "../../../service/student.service";
import {Gender} from "../../../entity/gender";
import {DatePipe} from "@angular/common";
import {Authorizationmanger} from "../../../service/authorizationmanger";

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css']
})
export class StudentComponent {
  cols = 12;

  columns: string [] = ['stuname','regno','dahamschool','grade','dob','phone','gender','guardian','address','edit']
  headers: string [] = ['Student Name','Register Number','Daham Pasala','Grade',' Date of Birth','Phone Number','Gender','Guardian Name','Address','Edit']
  binders: string [] = ['stuname','regno','dahamschool.name','grade.name','getMody()','phone','gender','guardian','address','getButton()']

  cscolumns: string[] = ['csname','csregno','csdahamschool','csgrade'];
  csprompts: string[] = ['Search by name','Search by reg_num','Search by Daham Pasala','Search by Grade'];

  selectedRow: any;
  public form!: FormGroup;
  public csearch!: FormGroup;

  enaadd:boolean =false;
  enaupd:boolean =false;
  enadel:boolean =false;

  oldstuObj!: Student | undefined;
  stuObj!: Student;

  grades: Array<Grade> = [];
  genders: Array<Gender> = [];
  dahampasals: Array<Dahampasal> = [];
  students: Array<Student> = [];
  imageurl : string = '';
  data!: MatTableDataSource<Student>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  uiassist : UiAssist;

  constructor(private fb: FormBuilder,
              private matDialog: MatDialog,
              private dahampasalService: DahampasalService,
              private gradeService: GradeService,
              private studentService: StudentService,
              private dp: DatePipe,
              private authorizationmanger: Authorizationmanger
  ) {

    this.uiassist = new UiAssist(this);

    this.form= this.fb.group({
      'stuname': new FormControl('',[Validators.required]),
      'regno': new FormControl('',[Validators.required]),
      'dahamschool': new FormControl('',[Validators.required]),
      'dob': new FormControl('',[Validators.required]),
      'gender': new FormControl('',[Validators.required]),
      'address': new FormControl('',[Validators.required]),
      'phone': new FormControl('',[Validators.required,Validators.pattern('^[0-9]{10}$')]),
      'guardian': new FormControl('',[Validators.required]),
      'grade': new FormControl('',[Validators.required]),

    });

    this.csearch = this.fb.group({
      'csname': new FormControl(),
      'csregno': new FormControl(),
      'csdahamschool': new FormControl(),
      'csgrade': new FormControl()
    });
  }

  getButton(element:Student){
    return `<button>Edit</button>`;
  }
  getMody(element:Student){
    return element.dob.split('T')[0];

  }

  createView() {
    this.imageurl='assets/pending.gif';
    this.loadTable();
  }

  loadTable(){
    this.studentService.getAll()
      .then((daham: Student[]) => {this.students=daham; this.imageurl='assets/fullfilled.png';})
      .catch((error) => {
        this.matDialog.open(MessageComponent, {
          width: '500px',
          data: {heading: "Status -", message: error.error.message}
        });
        // stsmsg.afterClosed().subscribe(async result => { if (!result) { return;} }) ;} );

        this.imageurl='assets/rejected.png';})
      .finally(()=> {this.data = new MatTableDataSource(this.students); this.data.paginator=this.paginator;});

  }

  ngOnInit(){
    this.initialize();
    this.checkButtonPrivileges();
  }

  initialize(){
    this.createform();
    this.createView();

    this.gradeService.getAll().then((sbms: Grade[]) =>{this.grades = sbms;});

    this.dahampasalService.getAll().then((sbms: Dahampasal[]) =>{this.dahampasals = sbms;});

    this.genders = [{id: 1, name: 'Male' },{id: 2, name: 'Female' }]

  }

  createform(){

    this.form.controls['stuname']?.setValidators([Validators.required]);
    this.form.controls['regno']?.setValidators([Validators.required]);
    this.form.controls['dahamschool']?.setValidators([Validators.required]);
    this.form.controls['address']?.setValidators([Validators.required]);
    this.form.controls['dob']?.setValidators([Validators.required]);
    this.form.controls['address']?.setValidators([Validators.required]);
    this.form.controls['guardian']?.setValidators([Validators.required]);
    this.form.controls['grade']?.setValidators([Validators.required]);
    this.form.controls['phone']?.setValidators([Validators.required,Validators.pattern('^[0-9]{10}$')]);

    Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {

        if (this.oldstuObj != undefined && control.valid){
          // @ts-ignore
          if (value === this.stuObj[controlName]){ control.markAsPristine(); }
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
    const studentPrivileges = this.authorizationmanger.privileges.filter(
      // @ts-ignore
      privilege => privilege.startsWith('student_')
    );
    // Enable/disable buttons based on privileges
    this.enaadd = studentPrivileges.some(privilege => privilege === 'student_add');
    this.enaupd = studentPrivileges.some(privilege => privilege === 'student_update');
    this.enadel = studentPrivileges.some(privilege => privilege === 'student_delete');
  }

  filterTable() {
    const csearchdata = this.csearch.getRawValue();

    // @ts-ignore
    this.data.filterPredicate = (daham: Student, filter: string)=>{
      return(csearchdata.csname==null||daham.stuname.toLowerCase().includes(csearchdata.csname))&&
        (csearchdata.csregno==null||daham.regno.toLowerCase().includes(csearchdata.csregno))&&
        (csearchdata.csdahamschool==null||daham.dahamschool.name.toLowerCase().includes(csearchdata.csdahamschool))&&
        (csearchdata.csgrade==null||daham.grade.name.toLowerCase().includes(csearchdata.csgrade));
    }
    this.data.filter="xx";
  }

  fillForm(student: Student) {
    this.selectedRow = student;

    this.enaadd = false;


    this.stuObj = JSON.parse(JSON.stringify(student));
    this.oldstuObj = JSON.parse(JSON.stringify(student));

    // @ts-ignore
    this.stuObj.grade = this.grades.find(grade=> grade.id === this.stuObj.grade.id);

    // @ts-ignore
    this.stuObj.dahamschool = this.dahampasals.find(daham=> daham.id === this.stuObj.dahamschool.id);

    // @ts-ignore
    this.stuObj.gender = this.genders.find(gender=> gender.name === student.gender);

    this.form.controls['dahamschool'].setValue(this.stuObj.dahamschool);
    this.form.controls['grade'].setValue(this.stuObj.grade);
    this.form.patchValue(this.stuObj);
    // @ts-ignore
    this.stuObj.dahamschool = JSON.parse(JSON.stringify(student.dahamschool));
    this.stuObj.grade = JSON.parse(JSON.stringify(student.grade));
    // @ts-ignore
    this.form.controls['dahamschool'].setValue(this.stuObj.dahamschool.id);
    this.form.controls['grade'].setValue(this.stuObj.grade.id);
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
        data: {heading: "Errors - Student Register ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      const data = this.form.getRawValue();

      const formData = new FormData();

      formData.append('stuname', data.stuname);
      formData.append('regno', data.regno);
      formData.append('address', data.address);
      formData.append('phone', data.phone);
      formData.append('gender', data.gender.name);
      formData.append('guardian', data.guardian);
      // @ts-ignore
      formData.append('dob', this.dp.transform(new Date(data.dob), 'yyyy-MM-dd'));
      formData.append('dahamschool_id', JSON.stringify(data.dahamschool));
      formData.append('grade_id', JSON.stringify(data.grade));

      let sbmData: string = "";
      sbmData = sbmData + "<br>Student Name is : "+ data.stuname;
      const confirm = this.matDialog.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Student Add",
          message: "Are you sure to Add the folowing student? <br> <br>"+ sbmData}
      });
      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          this.studentService.add(formData).then((responce: []|undefined) => {
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
              this.oldstuObj = undefined;
              this.form.reset();
              Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
              this.checkButtonPrivileges();
              this.loadTable();
            }
            const stsmsg = this.matDialog.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status -Student Registerd", message: addmessage}
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
        data: {heading: "Errors - Student Update ", message: "You have following Errors <br> " + errors}
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
            data.id = this.oldstuObj?.id;

            const formData = new FormData();

            formData.append("id", data.id);
            formData.append('stuname', data.stuname);
            formData.append('regno', data.regno);
            formData.append('address', data.address);
            formData.append('phone', data.phone);
            formData.append('gender', data.gender.name);
            formData.append('guardian', data.guardian);
            // @ts-ignore
            formData.append('dob', this.dp.transform(new Date(data.dob), 'yyyy-MM-dd'));
            formData.append('dahamschool_id', JSON.stringify(data.dahamschool));
            formData.append('grade_id', JSON.stringify(data.grade));

            this.studentService.update(formData).then((responce: [] | undefined) => {
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
                this.oldstuObj = undefined;
                this.form.reset();
                Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
                this.checkButtonPrivileges();
                this.loadTable();
              }
              const stsmsg = this.matDialog.open(MessageComponent, {
                width: '500px',
                data: {heading: "Status -Student Update", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.matDialog.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Student Update", message: "Nothing Changed"}
        });
        updmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
      }
    }
  }

  delete() {
    const confirm = this.matDialog.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - Student Delete",
        message: "Are you sure to Delete following Student? <br> <br>" +
          this.stuObj.stuname
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";

        this.studentService.delete(this.stuObj.id).then((responce: [] | undefined) => {
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
            this.oldstuObj = undefined;
            this.form.reset();
            this.selectedRow ="";
            this.checkButtonPrivileges();
            Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
            this.loadTable();

          }
          const stsmsg = this.matDialog.open(MessageComponent, {
            width: '500px',
            data: {heading: "Status - Student Delete ", message: delmessage}
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
        this.oldstuObj =undefined;
        this.form.reset();
        this.selectedRow ="";
        this.checkButtonPrivileges();
        Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
        this.loadTable();
      }
    });
  }

}
