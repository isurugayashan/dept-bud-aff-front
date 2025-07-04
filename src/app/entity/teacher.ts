import {District} from "./district";
import {Sbm} from "./sbm";
import {Dahampasal} from "./dahampasal";
import {Grade} from "./grade";
import {Gender} from "./gender";
import {User} from "./user";
import {Title} from "./title";

export class Teacher{

  public id!:  number;

  public name!:  string;

  public user!:  User;

  public nic!:  string;

  public title!:  Title;

  public phone!:  string;

  public dahamschool!:  Dahampasal;

  public createdate!:  string;

  public updatedate!:  string;


  constructor(id: number, name: string, user: User, nic: string, title: Title,
              phone: string, dahamschool: Dahampasal, createdate: string, updatedate: string) {

    this.id = id;
    this.name = name;
    this.user = user;
    this.nic = nic;
    this.title = title;
    this.phone = phone;
    this.dahamschool = dahamschool;
    this.createdate = createdate;
    this.updatedate = updatedate;
  }
}
