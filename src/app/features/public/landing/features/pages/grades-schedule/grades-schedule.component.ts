import { Component } from '@angular/core';
import { FeaturePageShellComponent } from '../../feature-page-shell/feature-page-shell.component';
import { FEATURES } from '../../feature-data';

@Component({
  selector: 'app-grades-schedule',
  standalone: true,
  imports: [FeaturePageShellComponent],
  templateUrl: './grades-schedule.component.html',
  styleUrl: './grades-schedule.component.css',
})
export class GradesScheduleComponent {
  feature = FEATURES['grades-schedule'];
}
