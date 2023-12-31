import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Injectable({ providedIn: 'root' })
export class isAuthenticated implements CanActivate {

    //sa ovim gardom smo rekli mozes pristupiti komponenti samo ako si logovan
    constructor(
        private router: Router,
        private authService: AuthService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (this.authService.isAuthenticated.value) {
            return true;
        } else {
            this.router.navigate(['/home']);
            return false;
        }
    }
}