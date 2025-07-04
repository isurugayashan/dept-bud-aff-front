import {District} from "./district";
import {Excenter} from "./excenter";
import {Dahampasal} from "./dahampasal";
import {Role} from "./role";
import {Privilege} from "./privilege";

export class Rolepriv {

  public id!:  number;

  public role!:  Role;

  public privilege!:  Privilege;

  public updatedate!:  string;

  public createdate!:  string;


  constructor(id: number, role: Role, privilege: Privilege, updatedate: string, createdate: string) {
    this.id = id;
    this.role = role;
    this.privilege = privilege;
    this.updatedate = updatedate;
    this.createdate = createdate;
  }
}
