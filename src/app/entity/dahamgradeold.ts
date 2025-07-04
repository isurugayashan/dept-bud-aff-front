import {District} from "./district";
import {Excenter} from "./excenter";
import {Dahampasal} from "./dahampasal";
import {Role} from "./role";
import {Privilege} from "./privilege";
import {User} from "./user";
import {Grade} from "./grade";

export class Dahamgradeold {

  public id!: number;
  public dahamschool!: Dahampasal;
  public grades!:Array<Grade>;
  public grade!:Grade;
  public updatedate!: string;
  public createdate!: string;


  constructor(id: number, dahamschool: Dahampasal, grades: Array<Grade>, grade: Grade, updatedate: string, createdate: string) {
    this.id = id;
    this.dahamschool = dahamschool;
    this.grades = grades;
    this.grade = grade;
    this.updatedate = updatedate;
    this.createdate = createdate;
  }
}
