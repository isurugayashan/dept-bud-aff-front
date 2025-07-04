import {District} from "./district";

export class Sbm{

  public id!:  number;

  public name!:  string;

  public district!:  District;

  public createdate!:  string;

  public updatedate!:  string;


  constructor(id: number, name: string, district: District, createdate: string, updatedate: string) {
    this.id = id;
    this.name = name;
    this.district = district;
    this.createdate = createdate;
    this.updatedate = updatedate;
  }
}
