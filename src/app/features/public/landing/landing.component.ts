import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SchoolPhotoComponent } from './campus/school-photo.component';
import { LandingFeatureCardsComponent } from './features/landing-feature-cards.component';
import { PublicFooterComponent } from '../components/public-footer.component';
import { PublicNavComponent } from '../components/public-nav.component';

@Component({selector:'app-landing',standalone:true,imports:[RouterLink,SchoolPhotoComponent,LandingFeatureCardsComponent,PublicFooterComponent,PublicNavComponent],
  styleUrl:'./landing.component.css',templateUrl:'./landing.component.html'})
export class LandingComponent{
}
