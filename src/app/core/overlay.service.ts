import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OverlayService {
  private readonly scrollLocks = new Set<symbol>();
  private previousOverflow: string | null = null;

  acquireScrollLock(): () => void {
    const lock = Symbol();
    if (this.scrollLocks.size === 0) {
      this.previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    this.scrollLocks.add(lock);

    return () => {
      if (!this.scrollLocks.delete(lock) || this.scrollLocks.size > 0) return;
      document.body.style.overflow = this.previousOverflow ?? '';
      this.previousOverflow = null;
    };
  }
}
