import {Dahampasal} from "./dahampasal";

export class Excenter{

  public id!:  number;

  public dahamschool!:  Dahampasal;

  public createdate!:  string;

  public updatedate!:  string;


  constructor(id: number, dahamschool: Dahampasal, createdate: string, updatedate: string) {
    this.id = id;
    this.dahamschool = dahamschool;
    this.createdate = createdate;
    this.updatedate = updatedate;
  }
}
