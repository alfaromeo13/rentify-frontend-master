import { OnInit } from "@angular/core";
import { Component } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { switchMap } from "rxjs";
import { debounceTime } from "rxjs";
import { AuthService } from "../auth/services/auth.service";
import { CityWithCountry } from "../models/city-with-country.model";
import { CityService } from "../city/city.service";
import { NavbarLink } from "./navbar.model";
import { FilterService } from "../filter/filter.service";
import { ApartmentSearch } from "../models/search.model";
import { ApartmentDTO } from "../models/apartment.model";
import { ApartmentService } from "../apartment/apartment.service";
import { NotificationService } from "../services/notification.service";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    cities: CityWithCountry[] = [];
    citySearchForm: FormGroup;
    selectedCity: string = "";
    cityWithCountry: CityWithCountry | undefined;
    isMobileNavActive: boolean = false;
    isUserAuthenticated: boolean = false;
    recived = false;
    //we load navbar elements dynamicaly with ngFor
    links: NavbarLink[] = [
        {
            name: "Home",
            path: "/home"
        },
        {
            name: "Test",
            path: "/test"
        },
        {
            name: "Messages",
            path: "/messages"
        },
        {
            name: "Users",
            path: "/users"
        },
    ];

    constructor(
        private router: Router,
        public notificationService: NotificationService,
        private cityService: CityService,
        private filterService: FilterService,
        private apartmentService: ApartmentService,
        private authService: AuthService,
    ) { }

    ngOnInit(): void {
        this.filterService.pageNo = 1;
        this.authService.isAuthenticated.subscribe(data => {
            this.isUserAuthenticated = data;
        });
        this.initializeForm();
        this.citySearchForm.get('searchTerm')?.valueChanges
            .pipe(  //ova prica moze jer je reaktivna forma u pitanju,slusacemo na promjene u odredjenoj kontroli
                debounceTime(500), //svaki put kad se desi neka promjena sacekaj neko vrijeme pa pozovi api 
                switchMap(value => { return this.cityService.searchByTerm(value); })
            ).subscribe(data => { //podaci koje dobijamo sa strane bekenda
                this.cities = data;
            });
    }

    search() {
        if (this.selectedCity.length !== 0) {
            const cityData = this.selectedCity.split(',');
            const cityName = cityData.length >= 2 ? cityData[0].trim() : '';
            const countryCode = cityData.length >= 2 ? cityData[1].trim() : '';

            const apartmentSearch: ApartmentSearch = {
                cityName: cityName,
                countryCode: countryCode,
                isActive: true,
            };

            if (cityName.length > 0 && countryCode.length > 0) {
                localStorage.setItem('apartmentSearch', JSON.stringify(apartmentSearch));
                this.filterService.filter(apartmentSearch, 0).subscribe(
                    (apartmentDTOs: ApartmentDTO[]) => {
                        console.log(apartmentDTOs);
                        this.apartmentService.apartmentList = apartmentDTOs;
                        this.router.navigate(['apartments']);
                    }, (error) => {
                        console.error(error);
                    }
                );
            }
        }
    }

    private initializeForm(): void {
        this.citySearchForm = new FormGroup({
            searchTerm: new FormControl(null)
        });
    }

    toggleMobileView(): void {
        this.isMobileNavActive = !this.isMobileNavActive;
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['login'])
    }
}