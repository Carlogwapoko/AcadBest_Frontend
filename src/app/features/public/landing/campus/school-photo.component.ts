import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-school-photo',
  standalone: true,
  templateUrl: './school-photo.component.html',
  styleUrl: './school-photo.component.css',
})
export class SchoolPhotoComponent {
  @Input() src = 'images/school.jpg';
  @Input() alt = 'ACES Tagum College campus';
  @Input() caption = 'ACES Tagum College';
  @Input() subcaption = 'Tagum City, Davao del Norte';

  failed = false;
}
