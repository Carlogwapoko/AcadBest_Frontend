import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMMON } from '../../../shared/common';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [COMMON, IconComponent, RouterLink],
  templateUrl: './public-footer.component.html',
  styleUrl: './public-footer.component.css',
})
export class PublicFooterComponent {
  legal = '';
}
