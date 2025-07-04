import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HomeComponent} from './view/home/home.component';
import {LoginComponent} from './view/login/login.component';
import {MainwindowComponent} from './view/mainwindow/mainwindow.component';
import {EmployeeComponent} from './view/modules/employee/employee.component';
import {UserComponent} from './view/modules/user/user.component';
import {MatGridListModule} from "@angular/material/grid-list";
import {MatCardModule} from "@angular/material/card";
import {ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatListModule} from "@angular/material/list";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatIconModule} from "@angular/material/icon";
import {MessageComponent} from "./util/dialog/message/message.component";
import {MatDialogModule} from "@angular/material/dialog";
import { DistrictComponent } from './view/modules/district/district.component';
import { SbmComponent } from './view/modules/sbm/sbm.component';
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import { ConfirmComponent } from './util/dialog/confirm/confirm.component';
import {MatTableModule} from "@angular/material/table";
import {MatPaginatorModule} from "@angular/material/paginator";
import {FlexModule} from "@angular/flex-layout";
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from "@angular/common/http";
import {MatSelectModule} from "@angular/material/select";
import {NgSelectModule} from "@ng-select/ng-select";
import { DahampasalComponent } from './view/modules/dahampasal/dahampasal.component';
import {GradeComponent} from "./view/modules/grade/grade.component";
import { ExcenterComponent } from './view/modules/excenter/excenter.component';
import { DamexmComponent } from './view/modules/damexm/damexm.component';
import { PrivilegeComponent } from './view/modules/privilege/privilege.component';
import { RoleComponent } from './view/modules/role/role.component';
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {DatePipe} from "@angular/common";
import { RoleprivilegeComponent } from './view/modules/roleprivilege/roleprivilege.component';
import { UserroleComponent } from './view/modules/userrole/userrole.component';
import { StudentComponent } from './view/modules/student/student.component';
import { TeacherComponent } from './view/modules/teacher/teacher.component';
import { ChangePasswordComponent } from './view/modules/change-password/change-password.component';
import { ChangePasswordClientComponent } from './view/modules/change-password-client/change-password-client.component';
import { ConfirmResetComponent } from './view/modules/confirm-reset/confirm-reset.component';
import {Authorizationmanger} from "./service/authorizationmanger";
import {JwtInterceptor} from "./service/JwtIntercepter";





@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    MainwindowComponent,
    EmployeeComponent,
    UserComponent,
    MessageComponent,
    DistrictComponent,
    SbmComponent,
    ConfirmComponent,
    DahampasalComponent,
    GradeComponent,
    ExcenterComponent,
    DamexmComponent,
    PrivilegeComponent,
    RoleComponent,
    RoleprivilegeComponent,
    UserroleComponent,
    StudentComponent,
    TeacherComponent,
    ChangePasswordComponent,
    ChangePasswordClientComponent,
    ConfirmResetComponent,


  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatGridListModule,
        MatCardModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatToolbarModule,
        MatSidenavModule,
        MatListModule,
        MatExpansionModule,
        MatIconModule,
        MatDialogModule,
        MatSlideToggleModule,
        MatTableModule,
        MatPaginatorModule,
        FlexModule,
        HttpClientModule,
        NgSelectModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule



    ],
  providers: [DatePipe,Authorizationmanger,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor,multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule {
}
