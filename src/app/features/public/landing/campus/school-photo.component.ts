import { Component, Input, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-school-photo',
  standalone: true,
  templateUrl: './school-photo.component.html',
  styleUrl: './school-photo.component.css',
})
export class SchoolPhotoComponent implements OnInit, OnDestroy {
  @Input() caption = 'ACES Tagum College';
  @Input() subcaption = 'Tagum City, Davao del Norte';

  readonly slides = [
    { src: 'images/aces_front.jpg', alt: 'Front entrance of ACES Tagum College' },
    { src: 'images/aces_registrar.jpg', alt: 'ACES Tagum College registrar office' },
    { src: 'images/aces_building.jpg', alt: 'ACES Tagum College building' },
  ];

  currentIndex = 0;
  failed = false;
  private slideshowTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.scheduleNextSlide();
  }

  previous(): void {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.resetSlideshowTimer();
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.resetSlideshowTimer();
  }

  private scheduleNextSlide(): void {
    this.slideshowTimer = setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.slides.length;
      this.scheduleNextSlide();
    }, 10000);
  }

  private resetSlideshowTimer(): void {
    if (this.slideshowTimer !== undefined) {
      clearTimeout(this.slideshowTimer);
    }
    this.scheduleNextSlide();
  }

  ngOnDestroy(): void {
    if (this.slideshowTimer !== undefined) {
      clearTimeout(this.slideshowTimer);
    }
  }
}
