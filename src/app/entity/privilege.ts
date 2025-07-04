export class Privilege{

  public id!:  number;

  public operation!:  string;

  public createdate!:  string;

  public updatedate!:  string;


  constructor(id: number, operation: string, createdate: string, updatedate: string) {
    this.id = id;
    this.operation = operation;
    this.createdate = createdate;
    this.updatedate = updatedate;
  }
}
