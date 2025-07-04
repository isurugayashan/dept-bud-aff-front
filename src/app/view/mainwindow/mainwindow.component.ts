import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {MatSidenav} from "@angular/material/sidenav";
import {BreakpointObserver} from "@angular/cdk/layout";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";
import {AuthenticateService} from "../../service/AuthenticateService";
import {Token} from "@angular/compiler";
import {TokenService} from "../../service/token.service";
import {MatDialog} from "@angular/material/dialog";
import {MessageComponent} from "../../util/dialog/message/message.component";
import {UserService} from "../../service/user.service";
import {Authorizationmanger} from "../../service/authorizationmanger";



@Component({
  selector: 'app-mainwindow',
  templateUrl: './mainwindow.component.html',
  styleUrls: ['./mainwindow.component.css']
})
export class MainwindowComponent implements OnInit{
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  opened: boolean = true;
  isChecked: boolean = true;
  // @ts-ignore
  loggedIn : boolean;
  userName!: string;
  privileges = [] = []

  currentDateTime: string = '';
  private readonly localStorageUsreName = 'username';
  private readonly localStorageTeacher = 'teacher';
  private readonly localStorageDahampasal = 'dahamschool';
  private readonly localStorageSBM = 'sbm';
  private readonly localStorageGrade = 'grade';

  constructor(private router: Router,
              private observer: BreakpointObserver,
              private authenticateService:AuthenticateService,
              private tokenService: TokenService,
              private userService: UserService,
              private dialog: MatDialog,
              private authService: Authorizationmanger) {
  }

  getUsername() {
     return  localStorage.getItem(this.localStorageUsreName);
  }
  toggleCheckbox() {
    this.isChecked = !this.isChecked;
  }

  // getAuthService(): Authorizationmanger {
  //   return this.authService;
  // }

  capitalizeMenuItemName(name: string): string {
    switch (name) {
      case 'userpassword':
        return 'Change Password';
      case 'roleprivilege':
        return 'Role_vs_Privilege'
      case 'userrole':
        return 'User_vs_Role'
      case 'dahamexam':
        return 'Assign_Exam Center'
      case 'user':
        return 'Manage User'
      case 'dahamgrade':
        return 'Mange Grade'
      case 'dahampasala':
        return 'Manage Daham Pasala'
      case 'teacher':
        return 'Manage Teacher'
      case 'student':
        return 'Manage Student'
      case 'district':
        return 'Manage District'
      case 'sbm':
        return 'Manage SBM'
      case 'examcenter':
        return 'Manage Exam Center'
      default:
        // Default capitalization logic
        return name.charAt(0).toUpperCase() + name.slice(1);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.observer.observe(["(max-width: 800px)"]).subscribe((res) => {
        if (res.matches) {
          this.sidenav.mode = "over";
          this.sidenav.close();
        } else {
          this.sidenav.mode = "side";
          this.sidenav.open();
        }
      });
    }, 100); // Adjust the delay as needed
  }


  ngOnInit(){
    // this.authenticateService.authStatus.subscribe(value => this.loggedIn = value);
    // const payload =  this.tokenService.get();
    // // @ts-ignore
    // const urlUser = payload.split('.')[1];
    // this.decode(urlUser);
 }

 decode(urlUser: any) {
   const decodedPayload = JSON.parse(atob(urlUser));
   console.log(decodedPayload);
    this.privileges = decodedPayload.privileges;
   console.log(this.privileges)
    // const id = decodedPayload.sub;
    // this.getbyId(id);
  }

  // getbyId(id: number){
  //   this.userService.getByID(id).subscribe(
  //     data => this.GetUserName(data)
  //   )
  // }
  //
  // GetUserName(data: Object) {
  //   // @ts-ignore
  //   this.userName = data.name;
  // }
  //


   isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }



  updateDateTime(): string {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    this.currentDateTime = now.toLocaleString('en-US', options);
    return this.currentDateTime;
  }

  AdminmenuItems = this.authService.AdminmenuItems;
  LocationmenuItems = this.authService.LocationmenuItems;
  RegistrationmenuItems = this.authService.RegistrationmenuItems;
  DahampasalamenuItems = this.authService.DahampasalamenuItems;

  // @ts-ignore
  isMenuVisible(category: string) : boolean{
    switch (category){
      case 'admin':
        return this.AdminmenuItems.some(menuItem => menuItem.accessFlag);
      case  'location':
        return this.LocationmenuItems.some(menuItem => menuItem.accessFlag);
      case  'registration':
        return this.RegistrationmenuItems.some(menuItem => menuItem.accessFlag);
      case  'dahampasala':
        return this.DahampasalamenuItems.some(menuItem => menuItem.accessFlag);

      default:
        return false;
    }
 }

  logout($event: MouseEvent) {
    // @ts-ignore
    const dialogRef = this.dialog.open(MessageComponent, {
      width: '500px',
      data: {
        heading: "You are attempt to logout of the system",
        message: "Are you sure ??",
      }
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        $event.preventDefault();
        this.tokenService.remove();
        this.authenticateService.changeAuthStatus(false);
        this.router.navigateByUrl("login");
        this.authService.clearUsername();
        this.authService.clearButtonState();
        this.authService.clearMenuState();
        localStorage.removeItem(this.localStorageTeacher);
        localStorage.removeItem(this.localStorageDahampasal);
        localStorage.removeItem(this.localStorageSBM);
        localStorage.removeItem(this.localStorageGrade);
      }
    });
  }


  //Theme control
  onToggle($event: MatSlideToggleChange) {
    // @ts-ignore
    const element = document.querySelector("app-mainwindow").children[1].children[4];
    element.classList.toggle("dark");
    element.classList.toggle("dark1");
  }


}
