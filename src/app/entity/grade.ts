export class Grade{

  public id!:  number;

  public name!:  string;

  public createdate!:  string;

  public updatedate!:  string;


  constructor(id: number, name: string, createdate: string, updatedate: string) {
    this.id = id;
    this.name = name;
    this.createdate = createdate;
    this.updatedate = updatedate;
  }
}
