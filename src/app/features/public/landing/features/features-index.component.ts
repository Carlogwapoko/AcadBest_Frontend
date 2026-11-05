import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { FeaturePageShellComponent } from './feature-page-shell/feature-page-shell.component';
import { FEATURES } from './feature-data';

@Component({
  selector: 'app-features-index',
  standalone: true,
  imports: [FeaturePageShellComponent, IconComponent, RouterLink],
  templateUrl: './features-index.component.html',
  styleUrl: './features-index.component.css',
})
export class FeaturesIndexComponent {
  features = Object.values(FEATURES);
}
