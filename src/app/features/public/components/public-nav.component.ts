import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-public-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './public-nav.component.html',
  styleUrl: './public-nav.component.css',
})
export class PublicNavComponent {}
