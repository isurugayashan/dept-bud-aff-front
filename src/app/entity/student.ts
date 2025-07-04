import {District} from "./district";
import {Sbm} from "./sbm";
import {Dahampasal} from "./dahampasal";
import {Grade} from "./grade";
import {Gender} from "./gender";

export class Student{

  public id!:  number;

  public stuname!:  string;

  public regno!:  string;

  public dahamschool!:  Dahampasal;

  public dob!:  string;

  public gender!:  Gender;

  public address!:  string;

  public phone!:  string;

  public guardian!:  string;

  public grade!:  Grade;

  public createdate!:  string;

  public updatedate!:  string;


  constructor(id: number, stuname: string, regno: string, dahamschool: Dahampasal,
              dob: string, gender: Gender, address: string, phone: string, guardian: string, grade: Grade,
              createdate: string, updatedate: string) {
    this.id = id;
    this.stuname = stuname;
    this.regno = regno;
    this.dahamschool = dahamschool;
    this.dob = dob;
    this.gender = gender;
    this.address = address;
    this.phone = phone;
    this.guardian = guardian;
    this.grade = grade;
    this.createdate = createdate;
    this.updatedate = updatedate;
  }
}
