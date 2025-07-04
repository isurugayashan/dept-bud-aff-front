import {Injectable, OnInit} from "@angular/core";
import {AuthenticateService} from "./AuthenticateService";
import {TokenService} from "./token.service";


@Injectable()
export class Authorizationmanger{
  private readonly localStorageUsreName = 'username';
  private readonly localStoragetoken = 'token';
  private readonly localStorageButtonKey = 'buttonState';
  private readonly localStorageLocationMenu = 'LocationmenueState';
  private readonly localStorageRegistrationMenu = 'RegistrationmenueState';
  private readonly localStorageDahampasalaMenu = 'DahampasalamenueState';
  private readonly localStorageAdminMenu = 'AdminmenuState';

  public enaadd = false;
  public enaupd = false;
  public enadel = false;
  public enreset = false;

  loggedIn! : boolean;
  privileges = [] = []
  constructor(private authenticateService: AuthenticateService,
              private tokenService:TokenService) {

  }
  AdminmenuItems = [
    { name: 'role', accessFlag: true, routerLink: 'role' },
    { name: 'privilege', accessFlag: true, routerLink: 'privilege' },
    { name: 'roleprivilege', accessFlag: true, routerLink: 'roleprive' },
    { name: 'userrole', accessFlag: true, routerLink: 'userrole' }
  ];

  LocationmenuItems = [
    { name: 'district', accessFlag: true, routerLink: 'district' },
    { name: 'sbm', accessFlag: true, routerLink: 'sbm' },
    { name: 'examcenter', accessFlag: true, routerLink: 'excenter' },
    { name: 'dahamexam', accessFlag: true, routerLink: 'damcenter' }
  ];

  RegistrationmenuItems = [
    { name: 'user', accessFlag: true, routerLink: 'user' },
    { name: 'userpassword', accessFlag: true, routerLink: 'changepassword' },
    { name: 'student', accessFlag: true, routerLink: 'student' },
    { name: 'teacher', accessFlag: true, routerLink: 'teacher' }
  ];

  DahampasalamenuItems = [
    { name: 'dahampasala', accessFlag: true, routerLink: 'dahampasal' },
    { name: 'dahamgrade', accessFlag: true, routerLink: 'grade' },

  ];

  // enableButtons(authorities: { module: string; operation: string }[]): void {
  //
  //   this.enaadd = authorities.some(authority => authority.operation === 'add');
  //   this.enaupd = authorities.some(authority => authority.operation === 'update');
  //   this.enadel = authorities.some(authority => authority.operation === 'delete');
  //   this.enreset = authorities.some(authority => authority.operation === 'reset');
  //
  //   // Save button state in localStorage
  //   localStorage.setItem(this.localStorageButtonKey, JSON.stringify({ enaadd: this.enaadd, enaupd: this.enaupd, enadel: this.enadel, enreset: this.enreset }));
  // }

  enableMenues(modules: { module: string; operation: string }[]): void {
    // Enable Admin menu items
    this.AdminmenuItems.forEach(menuItem => {
      menuItem.accessFlag = modules.some(module => module.module.toLowerCase() === menuItem.name.toLowerCase());
    });

    //Enable Subject menu items
    this.LocationmenuItems.forEach(menuItem => {
      menuItem.accessFlag = modules.some(module => module.module.toLowerCase() === menuItem.name.toLowerCase());
    });

    // Enable Students menu items
    this.RegistrationmenuItems.forEach(menuItem => {
      menuItem.accessFlag = modules.some(module => module.module.toLowerCase() === menuItem.name.toLowerCase());
    });

    // Enable Students menu items
    this.DahampasalamenuItems.forEach(menuItem => {
      menuItem.accessFlag = modules.some(module => module.module.toLowerCase() === menuItem.name.toLowerCase());
    });


    // Save each menu state in localStorage
    localStorage.setItem(this.localStorageAdminMenu, JSON.stringify(this.AdminmenuItems));
    localStorage.setItem(this.localStorageLocationMenu, JSON.stringify(this.LocationmenuItems));
    localStorage.setItem(this.localStorageDahampasalaMenu, JSON.stringify(this.DahampasalamenuItems));
    localStorage.setItem(this.localStorageRegistrationMenu, JSON.stringify(this.RegistrationmenuItems));

  }

  getUsername() {
    localStorage.getItem(this.localStorageUsreName);
  }

  async getToken(): Promise<void> {
  try {
    this.authenticateService.authStatus.subscribe(value => this.loggedIn = value)
    const payload =  localStorage.getItem(this.localStoragetoken);
    // @ts-ignore
    const urlUser = payload.split('.')[1];
    this.decode(urlUser);
  }catch (error){
    console.log(error);
  }
  }

  decode(urlUser: any) {
    const decodedPayload = JSON.parse(atob(urlUser));
     this.privileges = decodedPayload.privileges;
    const authoroties = this.privileges.map(privilege => {
      // @ts-ignore
      const [module, operation] = privilege.split('_');
      return { module, operation };
    });

// privilegeObjects now contains an array of objects, each representing a privilege
    this.enableMenues(authoroties);
    //this.enableButtons(authoroties);
  }

  getEnaAdd(): boolean {
    return this.enaadd;
  }

  getEnaUpd(): boolean {
    return this.enaupd;
  }

  getEnaDel(): boolean {
    return this.enadel;
  }

  getEnaRest():boolean{
    return  this.enreset
  }

  initializeButtonState(): void {
    const buttonState = localStorage.getItem(this.localStorageButtonKey);
    // console.log(buttonState)
    if (buttonState) {
      const { enaadd, enaupd, enadel, enreset } = JSON.parse(buttonState);
      this.enaadd = enaadd;
      this.enaupd = enaupd;
      this.enadel = enadel;
      this.enreset = enreset;
    }
  }

  initializeMenuState(): void {
    const adminMenuState = localStorage.getItem(this.localStorageAdminMenu);
    const LocationMenuState = localStorage.getItem(this.localStorageLocationMenu);
    const RegistrationMenuState = localStorage.getItem(this.localStorageRegistrationMenu);
    const DahampasalaMenuState = localStorage.getItem(this.localStorageDahampasalaMenu);

    if (adminMenuState) {
      this.AdminmenuItems = JSON.parse(adminMenuState);
    }

    if (LocationMenuState) {
      this.LocationmenuItems = JSON.parse(LocationMenuState);
    }

    if (RegistrationMenuState) {
      this.RegistrationmenuItems = JSON.parse(RegistrationMenuState);
    }

    if (DahampasalaMenuState) {
      this.DahampasalamenuItems = JSON.parse(DahampasalaMenuState);
    }


  }

  clearUsername(): void {
    localStorage.removeItem(this.localStorageUsreName);
  }

  clearButtonState(): void {
    localStorage.removeItem(this.localStorageButtonKey);
  }

  clearMenuState(): void {
    localStorage.removeItem(this.localStorageAdminMenu);
    localStorage.removeItem(this.localStorageDahampasalaMenu);
    localStorage.removeItem(this.localStorageLocationMenu);
    localStorage.removeItem(this.localStorageRegistrationMenu);

  }

  isMenuItemDisabled(menuItem: { accessFlag: boolean }): boolean {
    return !menuItem.accessFlag;
  }
}
