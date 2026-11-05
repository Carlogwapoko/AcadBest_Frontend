import { Component } from '@angular/core';
import { FeaturePageShellComponent } from '../../feature-page-shell/feature-page-shell.component';
import { FEATURES } from '../../feature-data';

@Component({
  selector: 'app-service-requests',
  standalone: true,
  imports: [FeaturePageShellComponent],
  templateUrl: './service-requests.component.html',
  styleUrl: './service-requests.component.css',
})
export class ServiceRequestsComponent {
  feature = FEATURES['service-requests'];
}
