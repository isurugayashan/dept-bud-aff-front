import {District} from "./district";
import {Excenter} from "./excenter";
import {Dahampasal} from "./dahampasal";
import {Role} from "./role";
import {Privilege} from "./privilege";
import {User} from "./user";
import {Grade} from "./grade";

export class Dahamgrade {

  public id!:  number;

  public dahampasal!:  Dahampasal;

  public grade!:  Grade;

  public updatedate!:  string;

  public createdate!:  string;


  constructor(id: number, dahampasal: Dahampasal, grade: Grade, updatedate: string, createdate: string) {
    this.id = id;
    this.dahampasal = dahampasal;
    this.grade = grade;
    this.updatedate = updatedate;
    this.createdate = createdate;
  }

}
