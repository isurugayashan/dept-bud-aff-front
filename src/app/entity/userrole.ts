import {District} from "./district";
import {Excenter} from "./excenter";
import {Dahampasal} from "./dahampasal";
import {Role} from "./role";
import {Privilege} from "./privilege";
import {User} from "./user";

export class Userrole {

  public id!:  number;

  public role!:  Role;

  public user!:  User;

  public updatedate!:  string;

  public createdate!:  string;


  constructor(id: number, role: Role, user: User, updatedate: string, createdate: string) {
    this.id = id;
    this.role = role;
    this.user = user;
    this.updatedate = updatedate;
    this.createdate = createdate;
  }
}
