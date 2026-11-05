import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeaturePageShellComponent } from '../../features/feature-page-shell/feature-page-shell.component';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [FeaturePageShellComponent, RouterLink],
  templateUrl: './how-it-works.component.html',
  styleUrl: './how-it-works.component.css',
})
export class HowItWorksComponent {}
