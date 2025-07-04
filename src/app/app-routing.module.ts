import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from "./view/login/login.component";
import {MainwindowComponent} from "./view/mainwindow/mainwindow.component";
import {EmployeeComponent} from "./view/modules/employee/employee.component";
import {HomeComponent} from "./view/home/home.component";
import {UserComponent} from "./view/modules/user/user.component";
import {DistrictComponent} from "./view/modules/district/district.component";
import {SbmComponent} from "./view/modules/sbm/sbm.component";
import {DahampasalComponent} from "./view/modules/dahampasal/dahampasal.component";
import {GradeComponent} from "./view/modules/grade/grade.component";
import {ExcenterComponent} from "./view/modules/excenter/excenter.component";
import {DamexmComponent} from "./view/modules/damexm/damexm.component";
import {PrivilegeComponent} from "./view/modules/privilege/privilege.component";
import {RoleComponent} from "./view/modules/role/role.component";
import {RoleprivilegeComponent} from "./view/modules/roleprivilege/roleprivilege.component";
import {Userrole} from "./entity/userrole";
import {UserroleComponent} from "./view/modules/userrole/userrole.component";
import {TeacherComponent} from "./view/modules/teacher/teacher.component";
import {StudentComponent} from "./view/modules/student/student.component";
import {BeforeLoginService} from "./service/before-login.service";
import {AfterLoginService} from "./service/after-login.service";
import {ChangePasswordComponent} from "./view/modules/change-password/change-password.component";
import {ChangePasswordClientComponent} from "./view/modules/change-password-client/change-password-client.component";
import {ConfirmResetComponent} from "./view/modules/confirm-reset/confirm-reset.component";


const routes: Routes = [
  {path: "login", component: LoginComponent,canActivate:[BeforeLoginService]},
  {path: "changepasswordclient", component: ChangePasswordClientComponent,canActivate:[BeforeLoginService]},
  {path: 'confirm-rest/:email', component: ConfirmResetComponent,canActivate:[BeforeLoginService]},
  {path: "", redirectTo: 'login', pathMatch: 'full'},
  {
    path: "main",
    component: MainwindowComponent,canActivate:[AfterLoginService],
    children: [
      {path: "home", component: HomeComponent, canActivate:[AfterLoginService]},
      {path: "employee", component: EmployeeComponent,canActivate:[AfterLoginService]},
      {path: "user", component: UserComponent,canActivate:[AfterLoginService]},
      {path: "district", component: DistrictComponent,canActivate:[AfterLoginService]},
      {path: "sbm", component: SbmComponent,canActivate:[AfterLoginService]},
      {path: "dahampasal", component: DahampasalComponent,canActivate:[AfterLoginService]},
      {path: "grade", component: GradeComponent,canActivate:[AfterLoginService]},
      {path: "excenter", component: ExcenterComponent,canActivate:[AfterLoginService]},
      {path: "damcenter", component: DamexmComponent,canActivate:[AfterLoginService]},
      {path: "privilege", component: PrivilegeComponent,canActivate:[AfterLoginService]},
      {path: "role", component: RoleComponent,canActivate:[AfterLoginService]},
      {path: "roleprive", component: RoleprivilegeComponent,canActivate:[AfterLoginService]},
      {path: "userrole", component: UserroleComponent,canActivate:[AfterLoginService]},
      {path: "teacher", component: TeacherComponent,canActivate:[AfterLoginService]},
      {path: "student", component: StudentComponent,canActivate:[AfterLoginService]},
      {path: "changepassword", component: ChangePasswordComponent,canActivate:[AfterLoginService]},

    ]
  }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
