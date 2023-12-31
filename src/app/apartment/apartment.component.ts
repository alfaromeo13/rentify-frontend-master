import { Component, OnInit } from '@angular/core';
import { ApartmentService } from './apartment.service';
import { FilterService } from '../filter/filter.service';
import { ApartmentDTO } from '../models/apartment.model';
import { OnDestroy } from '@angular/core';
import { ApartmentSearch } from '../models/search.model';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-apartment',
  templateUrl: './apartment.component.html',
  styleUrls: ['./apartment.component.css']
})
export class ApartmentComponent implements OnInit, OnDestroy {

  PAGE_TOLERANCE: number = 3;
  selectedSearch: ApartmentSearch;

  constructor(
    public notificationService: NotificationService,
    public filterService: FilterService,
    public apartmentService: ApartmentService
  ) { }

  ngOnDestroy(): void {
    this.apartmentService.show = true;
    localStorage.removeItem('liked');
  }

  ngOnInit(): void {
    if (this.apartmentService.apartmentList.length !== 0) {
      this.apartmentService.generateRooms();
      const storedData = localStorage.getItem('apartmentSearch');
      if (storedData) this.selectedSearch = JSON.parse(storedData);
    } else {
      this.apartmentService.showLoader = true;
      const storedData = localStorage.getItem('apartmentSearch');
      const isLiked = localStorage.getItem('liked');
      if (isLiked) {
        this.apartmentService.show = false;
        this.apartmentService.allFavorite();
      }
      else if (storedData) {
        this.selectedSearch = JSON.parse(storedData);
        this.filterService.filter(this.selectedSearch, 0).subscribe(
          (apartmentDTOs: ApartmentDTO[]) => {
            console.log(apartmentDTOs);
            this.apartmentService.apartmentList = apartmentDTOs;
            this.apartmentService.showLoader = false;
            this.apartmentService.generateRooms();
            if (apartmentDTOs.length == 0)
              this.filterService.showEmpty = true;
          }, (error) => {
            console.error(error);
          }
        );
      }
    }
  }

  set_page_no(newPageNo: number): void {
    if (newPageNo > 0) {
      this.filterService.showEmpty = false;
      this.apartmentService.apartmani = [];
      this.apartmentService.showLoader = true;
      this.filterService.pageNo = newPageNo;
      const storedData = localStorage.getItem('apartmentSearch');
      if (storedData) this.selectedSearch = JSON.parse(storedData);
      this.filterService.filter(this.selectedSearch, this.filterService.pageNo - 1).subscribe(
        (apartmentDTOs: ApartmentDTO[]) => {
          this.apartmentService.apartmentList = apartmentDTOs;
          this.apartmentService.generateRooms();
          this.apartmentService.showLoader = false;
          if (apartmentDTOs.length == 0)
            this.filterService.showEmpty = true;
        }, (error) => {
          this.apartmentService.showLoader = false;
          console.error(error);
        }
      );
    }
  }

  removeFavorite(id: number): void {
    this.apartmentService.deleteFavorite(id);
  }

  addFavorite(id: number): void {
    this.apartmentService.addFavorite(id);
  }

  click(): void {
    this.filterService.isActive = true;
  }
}