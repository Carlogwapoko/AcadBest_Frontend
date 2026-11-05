import { Component } from '@angular/core';
import { FeaturePageShellComponent } from '../../feature-page-shell/feature-page-shell.component';
import { FEATURES } from '../../feature-data';

@Component({
  selector: 'app-early-warning',
  standalone: true,
  imports: [FeaturePageShellComponent],
  templateUrl: './early-warning.component.html',
  styleUrl: './early-warning.component.css',
})
export class EarlyWarningComponent {
  feature = FEATURES['early-warning'];
}
