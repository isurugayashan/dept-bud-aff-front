import {District} from "./district";
import {Excenter} from "./excenter";
import {Dahampasal} from "./dahampasal";

export class Damexam {

  public id!:  number;

  public year!:  string;

  public excenter!:  Excenter;

  public dahamschool!:  Dahampasal;

  public updatedate!:  string;

  public createdate!:  string;


  constructor(id: number, year: string, excenter: Excenter, dahamschool: Dahampasal, updatedate: string, createdate: string) {
    this.id = id;
    this.year = year;
    this.excenter = excenter;
    this.dahamschool = dahamschool;
    this.updatedate = updatedate;
    this.createdate = createdate;
  }
}
