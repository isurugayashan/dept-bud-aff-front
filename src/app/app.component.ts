import {Component} from '@angular/core';
import {Authorizationmanger} from "./service/authorizationmanger";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Department of Buddhist Affairs';
  private readonly localStoragetoken = 'token';

  constructor(private authService: Authorizationmanger) {
    // this.authService.initializeButtonState();
    // this.authService.initializeMenuState();
    authService.getUsername();

  }
}
