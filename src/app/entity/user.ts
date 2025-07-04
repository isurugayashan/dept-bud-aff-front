import {District} from "./district";
import {Sbm} from "./sbm";
import {Status} from "./status";

export class User{

  public id!:  number;

  public name!:  string;

  public password!:  string;

  public email!:  string;

  public status!:  string;

  public Status!:  Status;

  public createdate!:  string;

  public updatedate!:  string;


  constructor(id: number, name: string, password: string, email: string, status: string, Status: Status, createdate: string, updatedate: string) {
    this.id = id;
    this.name = name;
    this.password = password;
    this.email = email;
    this.status = status;
    this.Status = Status;
    this.createdate = createdate;
    this.updatedate = updatedate;
  }
}
