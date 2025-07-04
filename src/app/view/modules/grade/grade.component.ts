import {Component, Input, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UiAssist} from "../../../util/ui.assist";
import {MatTableDataSource} from "@angular/material/table";
import {Grade} from "../../../entity/grade";
import {MatPaginator} from "@angular/material/paginator";
import {MatDialog} from "@angular/material/dialog";
import {GradeService} from "../../../service/grade.service";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {Dahampasal} from "../../../entity/dahampasal";
import {DahampasalService} from "../../../service/dahampasal.service";
import {Dahamgrade} from "../../../entity/dahamgrade";
import {MatSelectionList} from "@angular/material/list";
import {Dahamgradeold} from "../../../entity/dahamgradeold";
import {Authorizationmanger} from "../../../service/authorizationmanger";
import {Teacher} from "../../../entity/teacher";
import {Sbm} from "../../../entity/sbm";

@Component({
  selector: 'app-grade',
  templateUrl: './grade.component.html',
  styleUrls: ['./grade.component.css']
})
export class GradeComponent {
  cols = 12;

  columns: string [] = ['dahamschool','grade','edit']
  headers: string [] = ['Dahampasal Name','Grade Name','Edit']
  binders: string [] = ['getName()','getGrade()','getButton()']

  cscolumns: string[] = ['csname'];
  csprompts: string[] = ['Search by Daham-pasala-Name'];

  selectedRow: any;
  public form!: FormGroup;
  public csearch!: FormGroup;

  enaadd:boolean =false;
  enaupd:boolean =false;
  enadel:boolean =false;

  oldDisObj!: Grade | undefined;
  // olddahamgradeObj!: Dahamgrade | undefined;
  disObj!: Grade;
  // dahamgradeObj!: Dahamgrade;
  dahamgradeObj2!: Dahamgradeold;
  olddahamgradeObj2!: Dahamgradeold | undefined;

  @Input()grades: Array<Grade> = [];
  oldgrades:Array<Grade>=[];
  @Input()selectedgrades: Array<Grade> =[];

  @ViewChild('availablelist') availablelist!: MatSelectionList;
  @ViewChild('selectedlist') selectedlist!: MatSelectionList;
  // grades: Array<Grade> = [];
  dahampasals: Array<Dahampasal> = [];
  dahamGrades: Array<Dahamgradeold> = [];
  olddahamGrades: Array<Dahamgradeold> = [];
  imageurl : string = '';
  data!: MatTableDataSource<Dahamgradeold>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private readonly localStorageGrade = 'grade';
  private readonly localStorageDahampasal = 'dahamschool';
  uiassist : UiAssist;

  constructor(private fb: FormBuilder,
              private matDialog: MatDialog,
              private gradeService: GradeService,
              private dahampasalService: DahampasalService,
              private authorizationmanger: Authorizationmanger
  ) {

    this.uiassist = new UiAssist(this);

    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    this.form= this.fb.group({
      'dahamschool': new FormControl('',[Validators.required]),
      'grades': new FormControl('',[Validators.required]),
      'createdate': new FormControl(formattedDate),
    });

    this.csearch = this.fb.group({
      'csname': new FormControl()
    });
  }

  getButton(element:Dahamgrade){
    return `<button>Edit</button>`;
  }

  getGrade(element: Dahamgradeold) {
    let grades = '';

    element.grades.forEach((gradeArray) => {
      // @ts-ignore
      const grade = gradeArray;

      if (grade.name === undefined) {
        // Append grade.grade.name only if grade.name is undefined
        // @ts-ignore
        grades += grade.grade.name + ","+ "\n";
      } else {
        // Append grade.name if it's defined
        grades = grades + grade.name + "," + "\n";
      }
    });
    return grades;
  }



  getName(element:Dahamgradeold){
    // @ts-ignore
    if (element.grades.length === 0){
      let dahamschool = null
      return dahamschool;
    }
      let dahamschool = element.dahamschool.name;
    // @ts-ignore
   return dahamschool
 }


  createView() {
    this.imageurl='assets/pending.gif';
    this.loadTable();
  }

  loadTable() {
    // @ts-ignore
    const Grades = JSON.parse(localStorage.getItem(this.localStorageGrade));
    //console.log(Grades)
    // @ts-ignore
    if (Grades && Grades.length > 0) {
      // @ts-ignore
      this.olddahamGrades = Grades;
      this.imageurl = 'assets/fullfilled.png';
      this.data = new MatTableDataSource(this.olddahamGrades);
      this.data.paginator = this.paginator;
    } else {
      this.gradeService.getAlldahamgrades()
        .then((dis: Dahamgradeold[]) => {this.olddahamGrades=dis;this.imageurl='assets/fullfilled.png';})
        .catch((error) => { this.imageurl='assets/rejected.png';
          this.matDialog.open(MessageComponent, {
            width: '500px',
            data: {heading: "Status -", message: error.error.message}
          });
        })
        .finally(()=> {this.data = new MatTableDataSource(this.olddahamGrades); this.data.paginator=this.paginator;});
    }
  }

  ngOnInit(){
    this.initialize();
    this.checkButtonPrivileges();
  }

  initialize(){
    this.createform();
    this.createView();
    // @ts-ignore
    const Dahampasals = JSON.parse(localStorage.getItem(this.localStorageDahampasal));
    // @ts-ignore
    if (Dahampasals && Dahampasals.length > 0 ){
      this.dahampasals = Dahampasals;
      this.gradeService.getAll().then((sbms: Grade[]) =>{this.grades = sbms;this.oldgrades = Array.from(this.grades);});
    }else {
      this.dahampasalService.getAll().then((sbms: Dahampasal[]) =>{this.dahampasals = sbms;});
      this.gradeService.getAll().then((sbms: Grade[]) =>{this.grades = sbms;this.oldgrades = Array.from(this.grades);});
    }



  }

  createform(){
    this.form.controls['dahamschool']?.setValidators([Validators.required]);
    this.form.controls['grades'].setValidators([Validators.required]);
    Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {

        if (this.olddahamgradeObj2 != undefined && control.valid){
          // @ts-ignore
          if (value === this.dahamgradeObj2[controlName]){ control.markAsPristine(); }
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
      privilege => privilege.startsWith('dahamgrade_')
    );
    // Enable/disable buttons based on privileges
    this.enaadd = studentPrivileges.some(privilege => privilege === 'dahamgrade_add');
    this.enaupd = studentPrivileges.some(privilege => privilege === 'dahamgrade_update');
    this.enadel = studentPrivileges.some(privilege => privilege === 'dahamgrade_delete');
  }

  filterTable() {
    const csearchdata = this.csearch.getRawValue();
    // @ts-ignore
    this.data.filterPredicate = (dist: Dahamgradeold, filter: string)=>{

      return(csearchdata.csname==null||dist.dahamschool.name.toLowerCase().includes(csearchdata.csname))
    }
    this.data.filter="xx";
  }

  fillForm(grade: Dahamgradeold) {

    this.selectedRow = grade;

    this.enaadd = false;


    this.dahamgradeObj2 = JSON.parse(JSON.stringify(grade));
    this.olddahamgradeObj2 = JSON.parse(JSON.stringify(grade));

    // this.grades = Array.from(this.oldgrades);

    // @ts-ignore
    this.dahamgradeObj2.dahamschool = this.dahampasals.find(dahm=> dahm.id === this.dahamgradeObj2.dahamschool.id);

    this.form.controls['dahamschool'].setValue(this.dahamgradeObj2.dahamschool);
    this.form.patchValue(this.dahamgradeObj2);
    // @ts-ignore
    this.dahamgradeObj2.dahamschool = JSON.parse(JSON.stringify(grade.dahamschool));
    // @ts-ignore
    this.form.controls['dahamschool'].setValue(this.dahamgradeObj2.dahamschool.id);
    this.form.markAsPristine();

    this.dahamGrades = []
    // @ts-ignore
    const Grade =  JSON.parse(localStorage.getItem(this.localStorageGrade));
    if(Grade && Grade.length > 0){
    grade.grades.forEach(grades => {

      // @ts-ignore
      const dahamGrade = new Dahamgradeold();
      // @ts-ignore
      dahamGrade.grade = grades;
      // @ts-ignore
      // @ts-ignore
      this.dahamGrades.push(dahamGrade.grade);
      this.dahamGrades.forEach((ur) => this.grades = this.grades.filter((r) => r.id != ur.id));
    });
    }else {

      grade.grades.forEach(grades => {
        // @ts-ignore
        const dahamGrade = new Dahamgradeold();
        // @ts-ignore
        dahamGrade.grade = grades;
        // @ts-ignore
        this.dahamGrades.push(dahamGrade);
        this.dahamGrades.forEach((ur) => this.grades = this.grades.filter((r) => r.id != ur.id));
      });
     }
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
        data: {heading: "Errors - Grade Add ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{

      const data = this.form.getRawValue();
      let grades = [] = [];

      const formData = new FormData();

      formData.append('dahamschool_id', JSON.stringify(data.dahamschool));
      // @ts-ignore
       grades = data.grades.map(grade => grade.grade.id);
      // @ts-ignore
      grades.forEach(gradeId => {
        formData.append('grades[]', gradeId);
      });

      console.log(formData);
      let disData: string = "";
     // disData = disData + "<br>Grade_List ";
      const confirm = this.matDialog.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Grade Add",
          message: "Are you sure to Add the folowing Grade List? <br> <br>"+ disData}
      });

      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          this.gradeService.add(formData).then((responce: []|undefined) => {
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
              this.olddahamgradeObj2 = undefined;
              this.form.reset();
              Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
              this.checkButtonPrivileges();
              this.loadTable();
              this.leftAll();
              this.grades= this.oldgrades;
            }
            const stsmsg = this.matDialog.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status -Grade Add", message: addmessage}
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
        data: {heading: "Errors - Grade Update ", message: "You have following Errors <br> " + errors}
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
            console.log(this.olddahamgradeObj2?.dahamschool.id)
            console.log( JSON.stringify(data.dahamschool));

            let grades = [] = [];

            const formData = new FormData();
            // @ts-ignore
            formData.append('dahamId', this.olddahamgradeObj2?.dahamschool.id);
            formData.append('dahamschool_id', JSON.stringify(data.dahamschool));
            // @ts-ignore
            grades = data.grades.map(grade => grade.grade.id);
            // @ts-ignore
            grades.forEach(gradeId => {
              formData.append('grades[]', gradeId);
            });

            this.gradeService.update(formData).then((responce: [] | undefined) => {
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
                this.leftAll();
                this.grades= this.oldgrades;
              }
              const stsmsg = this.matDialog.open(MessageComponent, {
                width: '500px',
                data: {heading: "Status -Grade Name Update", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.matDialog.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Grade Name Update", message: "Nothing Changed"}
        });
        updmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
      }
    }
  }

  delete() {
    const confirm = this.matDialog.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - Grade Delete",
        message: "Are you sure to Delete following Grade? <br> <br>" +
          this.dahamgradeObj2.dahamschool.name
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";
        // @ts-ignore
        this.gradeService.delete(this.dahamgradeObj2.dahamschool.id).then((responce: [] | undefined) => {
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
            this.olddahamgradeObj2 = undefined;
            this.form.reset();
            this.selectedRow ="";
            this.checkButtonPrivileges();
            Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
            this.loadTable();
            this.leftAll();
            this.grades= this.oldgrades;

          }
          const stsmsg = this.matDialog.open(MessageComponent, {
            width: '500px',
            data: {heading: "Status - Grade Delete ", message: delmessage}
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
        this.olddahamgradeObj2 =undefined;
        this.form.reset();
        this.selectedRow ="";
        this.checkButtonPrivileges();
        Object.values(this.form.controls).forEach(control=>{control.markAsTouched();});
        this.loadTable();
        this.leftAll();
        this.grades= this.oldgrades;
      }
    });
  }

  //List transfer
  rightSelected() {
    // @ts-ignore
    this.dahamgradeObj2 = this.availablelist.selectedOptions.selected.map(option => {
      // @ts-ignore
      const dahamGrade = new Dahamgradeold();
      dahamGrade.grade = option.value;
      this.grades = this.grades.filter(grade => grade !== option.value); //Remove Selected
      // @ts-ignore
      this.dahamGrades.push(dahamGrade); // Add selected to Right Side
      return dahamGrade;
    });

    this.form.controls["grades"].clearValidators();
    this.form.controls["grades"].updateValueAndValidity(); // Update status
  }

  leftSelected(): void {
    const selectedOptions = this.selectedlist.selectedOptions.selected; // Right Side
    for (const option of selectedOptions) {
      const extdahamGrades = option.value;
      this.dahamGrades = this.dahamGrades.filter(grade => grade !== extdahamGrades); // Remove the Selected one From Right Side
      this.grades.push(extdahamGrades.grade)
    }
  }

   rightAll(): void {
     // @ts-ignore
     this.dahamgradeObj2 = this.availablelist.selectAll().map(option => {
      // @ts-ignore
       const dahamGrade = new Dahamgradeold();
       dahamGrade.grade = option.value;
       this.grades = this.grades.filter(grade => grade !== option.value); //Remove Selected
       // @ts-ignore
       this.dahamGrades.push(dahamGrade); // Add selected to Right Side
       return dahamGrade;
    });

    this.form.controls["grades"].clearValidators();
    this.form.controls["grades"].updateValueAndValidity();
  }

  leftAll():void{
    for(let dahamGrade of this.dahamGrades) this.grades.push(dahamGrade.grade);
    this.dahamGrades = [];
   }
}
