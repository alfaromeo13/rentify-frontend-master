import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { Login } from "../auth/models/login.model";
import { AuthService } from "../auth/services/auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router
  ) { }

  login(loginForm: any) {
    const loginData: Login = loginForm.value;
    this.authService.authenticate(loginData)
      .subscribe(data => {
        this.router.navigate(['home']);
        this.toastr.success('Successfully logged in!');
      });
  }
}