import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService, Enr } from '../../../core/data.service';
import { COMMON } from '../../../shared/common';

@Component({
  selector: 'app-track-application',
  standalone: true,
  imports: [COMMON, RouterLink],
  styleUrl: './track-application.component.css',
  templateUrl: './track-application.component.html',
})
export class TrackApplicationComponent {
  reference = '';
  email = '';
  application: Enr | null = null;
  error = '';
  busy = false;

  constructor(
    private readonly data: DataService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async track(): Promise<void> {
    if (this.busy) return;

    this.error = '';
    this.application = null;
    this.busy = true;
    try {
      this.application = await this.data.trackEnrollment(this.reference.trim(), this.email.trim());
    } catch (error) {
      const response = (error as { error?: { message?: string } })?.error;
      this.error =
        response?.message ||
        (error instanceof Error
          ? error.message
          : 'Unable to look up your application. Please try again.');
    } finally {
      this.busy = false;
      this.cdr.markForCheck();
    }
  }

  get statusClass(): string {
    switch (this.application?.st) {
      case 'Enrolled':
        return 'status-enrolled';
      case 'Rejected':
        return 'status-rejected';
      case 'Under Review':
        return 'status-review';
      default:
        return 'status-pending';
    }
  }
}
