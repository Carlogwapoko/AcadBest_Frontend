import { Component } from '@angular/core';
import { FeaturePageShellComponent } from '../../features/feature-page-shell/feature-page-shell.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FeaturePageShellComponent, IconComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {}
