import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { FEATURES } from './feature-data';

@Component({
  selector: 'app-landing-feature-cards',
  standalone: true,
  imports: [IconComponent, RouterLink],
  templateUrl: './landing-feature-cards.component.html',
  styleUrl: './landing-feature-cards.component.css',
})
export class LandingFeatureCardsComponent {
  features = Object.values(FEATURES);
}
