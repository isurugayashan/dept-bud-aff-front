import {District} from "./district";
import {Sbm} from "./sbm";

export class Dahampasal{

  public id!:  number;

  public name!:  string;

  public regno!:  string;

  public address!:  string;

  public phone!:  string;

  public sbm!:  Sbm;

  public createdate!:  string;

  public updatedate!:  string;


  constructor(id: number, name: string, regno: string, address: string, phone: string, sbm: Sbm, createdate: string, updatedate: string) {
    this.id = id;
    this.name = name;
    this.regno = regno;
    this.address = address;
    this.phone = phone;
    this.sbm = sbm;
    this.createdate = createdate;
    this.updatedate = updatedate;
  }
}
