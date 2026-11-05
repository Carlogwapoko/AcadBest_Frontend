import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { PublicFooterComponent } from '../../../components/public-footer.component';
import { PublicNavComponent } from '../../../components/public-nav.component';

@Component({
  selector: 'app-feature-page-shell',
  standalone: true,
  imports: [IconComponent, PublicFooterComponent, PublicNavComponent, RouterLink],
  templateUrl: './feature-page-shell.component.html',
  styleUrl: './feature-page-shell.component.css',
})
export class FeaturePageShellComponent {
  @Input() title = '';
  @Input() icon = '';
  @Input() backToFeatures = false;
  @Input() showLoginButton = false;
}
