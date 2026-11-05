import { Component } from '@angular/core';
import { FeaturePageShellComponent } from '../../feature-page-shell/feature-page-shell.component';
import { FEATURES } from '../../feature-data';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [FeaturePageShellComponent],
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.css',
})
export class AnnouncementsComponent {
  feature = FEATURES.announcements;
}
