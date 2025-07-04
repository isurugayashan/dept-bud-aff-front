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
import {Teacher} from "../../../entity/teacher";
import {DatePipe} from "@angular/common";
import {User} from "../../../entity/user";
import {Title} from "../../../entity/title";
import {TeacherService} from "../../../service/teacher.service";
import {UserService} from "../../../service/user.service";
import {Authorizationmanger} from "../../../service/authorizationmanger";
import {Status} from "../../../entity/status";
import {isEmpty} from "rxjs";
import {Grade} from "../../../entity/grade";

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styleUrls: ['./teacher.component.css']
})
export class TeacherComponent {
  cols = 12;

  columns: string [] = ['title','name','dahamschool','nic','phone','user','edit']
  headers: string [] = ['Title','Teacher Name','Daham Pasala','NIC','Phone Number','User-Name','Edit']
  binders: string [] = ['title','name','dahamschool.name','nic','phone','user.name','getButton()']

  cscolumns: string[] = ['csname','csnic','csdahamschool'];
  csprompts: string[] = ['Search by name','Search by Nic','Search by Daham Pasala'];

  selectedRow: any;
  public form!: FormGroup;
  public csearch!: FormGroup;

  enaadd:boolean =false;
  enaupd:boolean =false;
  enadel:boolean =false;

  oldtechObj!: Teacher | undefined;
  techObj!: Teacher;
  private readonly localStorageTeacher = 'teacher';
  private readonly localStorageDahampasal = 'dahamschool';
  users: Array<User> = [];
  titles: Array<Title> = [];
  statuses: Array<Status> = [];
  dahampasals: Array<Dahampasal> = [];
  teachers: Array<Teacher> = [];
  imageurl : string = '';
  // @ts-ignore
  TechId : number;
  data!: MatTableDataSource<Teacher>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  uiassist : UiAssist;

  constructor(private fb: FormBuilder,
              private matDialog: MatDialog,
              private dahampasalService: DahampasalService,
              private userService: UserService,
              private teacherService: TeacherService,
              private dp: DatePipe,
              private authorizationmanger: Authorizationmanger
  ) {

    this.uiassist = new UiAssist(this);

    this.form= this.fb.group({
      'title': new FormControl('',[Validators.required]),
      'name': new FormControl('',[Validators.required]),
      'dahamschool': new FormControl('',[Validators.required]),
      'nic': new FormControl('',[Validators.required,Validators.pattern('^(([\\\\d]{9}[vVxX])|([\\\\d]{12}))$')]),
      // 'user': new FormControl('',[Validators.required]),
      'phone': new FormControl('',[Validators.required,Validators.pattern('^[0-9]{10}$')]),
      'password': new FormControl('',[Validators.required]),
      'email': new FormControl('',[Validators.required,Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]),
      'Status': new FormControl('',[Validators.required]),
    });

    this.csearch = this.fb.group({
      'csname': new FormControl(),
      'csnic': new FormControl(),
      'csdahamschool': new FormControl()
    });

    // this.form.valueChanges.subscribe(() => {
    //   this.enaupd = this.form.valid;
    //   this.enadel = this.form.valid && this.oldtechObj !== undefined;
    // });
  }

  getButton(element:Teacher){
    return `<button>Edit</button>`;
  }

  createView() {
    this.imageurl='assets/pending.gif';
    this.loadTable();
  }

  loadTable() {
    // @ts-ignore
    const storedTeachers = JSON.parse(localStorage.getItem(this.localStorageTeacher));
    if (storedTeachers && storedTeachers.length === 1) {
      this.TechId = storedTeachers[0].id;
      this.teachers = storedTeachers;
      this.imageurl = 'assets/fullfilled.png';
      this.data = new MatTableDataSource(this.teachers);
      this.data.paginator = this.paginator;
    } else {
      this.teacherService.getAll()
        .then((teachers: Teacher[]) => {
          this.teachers = teachers;
          this.imageurl = 'assets/fullfilled.png';
        })
        .catch((error) => {
          this.matDialog.open(MessageComponent, {
            width: '500px',
            data: { heading: "Status -", message: error.error.message }
          });

          this.imageurl = 'assets/rejected.png';
        })
        .finally(() => {
          this.data = new MatTableDataSource(this.teachers);
          this.data.paginator = this.paginator;
        });
    }
  }



  ngOnInit(){
    this.initialize();
    this.checkButtonPrivileges();
  }

  initialize(){
    this.createform();
    this.createView();
    this.titles = [{id: 1, name: 'Mr.' },{id: 2, name: 'Mrs.' },{id: 3, name: 'Miss.' },{id: 4, name: 'Rev.' },{id: 5, name: 'Dr.' },{id: 6, name: 'Pro.' }]
    this.statuses = [{id: 1, name: 'Active' },{id: 2, name: 'Inactive' }];

    // @ts-ignore
    const Dahampasals = JSON.parse(localStorage.getItem(this.localStorageDahampasal));
    if (Dahampasals && Dahampasals.length > 0 ){
      this.dahampasals = Dahampasals;
    }else {
      this.dahampasalService.getAll().then((sbms: Dahampasal[]) =>{this.dahampasals = sbms;});
    }

  }

  createform(){

    this.form.controls['title']?.setValidators([Validators.required]);
    this.form.controls['name']?.setValidators([Validators.required]);
    this.form.controls['dahamschool']?.setValidators([Validators.required]);
    this.form.controls['nic']?.setValidators([Validators.required,Validators.pattern('^(([\\d]{9}[vVxX])|([\\d]{12}))$')]);
   // this.form.controls['user']?.setValidators([Validators.required]);
    this.form.controls['phone']?.setValidators([Validators.required,Validators.pattern('^[0-9]{10}$')]);
    this.form.controls['password']?.setValidators([Validators.required]);
    this.form.controls['email']?.setValidators([Validators.required,Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]);
    this.form.controls['Status']?.setValidators([Validators.required]);

    Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {

        if (this.oldtechObj != undefined && control.valid){
          // @ts-ignore
          if (value === this.techObj[controlName]){ control.markAsPristine(); }
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
    // console.log(this.authorizationmanger.privileges)
    const teacherPrivileges = this.authorizationmanger.privileges.filter(
      // @ts-ignore
      privilege => privilege.startsWith('teacher_')
    );
    // Enable/disable buttons based on privileges
    this.enaadd = teacherPrivileges.some(privilege => privilege === 'teacher_add');
    this.enaupd = teacherPrivileges.some(privilege => privilege === 'teacher_update');
    this.enadel = teacherPrivileges.some(privilege => privilege === 'teacher_delete');
    // console.log(this.enaupd,this.enadel,this.enaadd)
  }

  filterTable() {
    const csearchdata = this.csearch.getRawValue();

    // @ts-ignore
    this.data.filterPredicate = (daham: Teacher, filter: string)=>{
      return(csearchdata.csname==null||daham.name.toLowerCase().includes(csearchdata.csname))&&
        (csearchdata.csnic==null||daham.nic.toLowerCase().includes(csearchdata.csnic))&&
        (csearchdata.csdahamschool==null||daham.dahamschool.name.toLowerCase().includes(csearchdata.csdahamschool));
    }
    this.data.filter="xx";
  }

  fillForm(teacher: Teacher) {

    this.form.controls['password'].disable();
    this.form.controls['email'].disable();
    this.form.controls['Status'].disable();
    this.selectedRow = teacher;

    this.enaadd = false;

    this.techObj = JSON.parse(JSON.stringify(teacher));
    this.oldtechObj = JSON.parse(JSON.stringify(teacher));

    // @ts-ignore
    this.techObj.user = this.users.find(user=> user.id === this.techObj.user.id);

    // @ts-ignore
    this.techObj.dahamschool = this.dahampasals.find(daham=> daham.id === this.techObj.dahamschool.id);

    // @ts-ignore
    this.techObj.title = this.titles.find(title=> title.name === teacher.title);

    this.form.controls['dahamschool'].setValue(this.techObj.dahamschool);
    // this.form.controls['user'].setValue(this.techObj.user);
    this.form.patchValue(this.techObj);
    // @ts-ignore
    this.techObj.dahamschool = JSON.parse(JSON.stringify(teacher.dahamschool));
    this.techObj.user = JSON.parse(JSON.stringify(teacher.user));
    // @ts-ignore
    this.form.controls['dahamschool'].setValue(this.techObj.dahamschool.id);
    //this.form.controls['user'].setValue(this.techObj.user.id);
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
        data: {heading: "Errors - Teacher Register ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      const data = this.form.getRawValue();
      console.log(data);
      const formData = new FormData();

      formData.append('name', data.name);
      formData.append('nic', data.nic);
      formData.append('phone', data.phone);
      formData.append('status', data.Status.name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('title', data.title.name);
      formData.append('dahamschool_id', JSON.stringify(data.dahamschool));

      let sbmData: string = "";
      sbmData = sbmData + "<br>Teacher Name is : "+ data.name;
      const confirm = this.matDialog.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Teacher Add",
          message: "Are you sure to Add the folowing teacher? <br> <br>"+ sbmData}
      });
      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          this.teacherService.add(formData).then((responce: []|undefined) => {
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
              this.oldtechObj = undefined;
              this.form.reset();
              Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
              this.checkButtonPrivileges();
              this.loadTable();
            }
            const stsmsg = this.matDialog.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status -Teacher Registerd", message: addmessage}
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
        data: {heading: "Errors - Teacher Update ", message: "You have following Errors <br> " + errors}
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
            data.id = this.oldtechObj?.id;

            const formData = new FormData();
            formData.append("id", data.id)
            formData.append('name', data.name);
            formData.append('nic', data.nic);
            formData.append('phone', data.phone);
            formData.append('title', data.title.name);
            formData.append('dahamschool_id', JSON.stringify(data.dahamschool));
            formData.append('user_id', JSON.stringify(data.user));

            this.teacherService.update(formData).then((responce: [] | undefined) => {
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
                  // @ts-ignore
                this.teacherService.getById(this.TechId).then((teacher: Teacher | null) => {
                  if (teacher) {
                    localStorage.setItem('teacher', JSON.stringify(teacher));
                    // Now you can work with the teacher object
                  } else {
                    console.error('Teacher not found');
                  }
                  this.oldtechObj = undefined;
                  this.form.reset();
                  this.loadTable();
                  this.form.controls['password'].enable();
                  this.form.controls['email'].enable();
                  this.form.controls['Status'].enable();
                  Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
                  this.checkButtonPrivileges();
                });
              }
              const stsmsg = this.matDialog.open(MessageComponent, {
                width: '500px',
                data: {heading: "Status -Teacher Update", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.matDialog.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Teacher Update", message: "Nothing Changed"}
        });
        updmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
      }
    }
  }

  delete() {
    const confirm = this.matDialog.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - Teacher Delete",
        message: "Are you sure to Delete following Teacher? <br> <br>" +
          this.techObj.name
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";

        this.teacherService.delete(this.techObj.id).then((responce: [] | undefined) => {
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
            this.oldtechObj = undefined;
            this.form.reset();
            this.form.controls['password'].enable();
            this.form.controls['email'].enable();
            this.form.controls['Status'].enable();
            this.selectedRow ="";
            this.checkButtonPrivileges();
            Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
            this.loadTable();

          }
          const stsmsg = this.matDialog.open(MessageComponent, {
            width: '500px',
            data: {heading: "Status - Teacher Delete ", message: delmessage}
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
        this.oldtechObj =undefined;
        this.form.reset();
        this.form.controls['password'].enable();
        this.form.controls['email'].enable();
        this.form.controls['Status'].enable();
        this.selectedRow ="";
        this.checkButtonPrivileges();
        Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
        this.loadTable();
      }
    });
  }

}
