import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, OnDestroy, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-public-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './public-nav.component.html',
  styleUrl: './public-nav.component.css',
})
export class PublicNavComponent implements OnDestroy {
  @ViewChild('menuToggle') private menuToggle?: ElementRef<HTMLButtonElement>;

  menuOpen = false;
  private previousBodyOverflow = '';

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    @Inject(DOCUMENT) private readonly document: Document,
  ) {}

  toggleMenu(): void {
    if (this.menuOpen) {
      this.closeMenu();
      return;
    }

    this.previousBodyOverflow = this.document.body.style.overflow;
    this.document.body.style.overflow = 'hidden';
    this.menuOpen = true;
  }

  closeMenu(): void {
    if (!this.menuOpen) {
      return;
    }

    this.menuOpen = false;
    this.document.body.style.overflow = this.previousBodyOverflow;
  }

  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: MouseEvent): void {
    if (this.menuOpen && !this.host.nativeElement.contains(event.target as Node)) {
      this.closeMenu();
    }
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    if (this.menuOpen) {
      this.closeMenu();
      this.menuToggle?.nativeElement.focus();
    }
  }

  @HostListener('window:resize')
  closeOnDesktopResize(): void {
    if (window.innerWidth >= 768) {
      this.closeMenu();
    }
  }

  ngOnDestroy(): void {
    this.closeMenu();
  }
}
