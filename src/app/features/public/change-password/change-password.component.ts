import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { COMMON } from '../../../shared/common';
import { AuthService } from '../../../core/auth.service';
import { HOME } from '../../../core/nav';
import { UiService } from '../../../core/ui.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [COMMON, RouterLink],
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent {
  currentPassword = '';
  password = '';
  confirmation = '';
  showCurrentPassword = false;
  showPassword = false;
  showConfirmation = false;
  error = '';
  busy = false;

  constructor(
    public auth: AuthService,
    private router: Router,
    private ui: UiService,
    private cdr: ChangeDetectorRef,
  ) {}

  async submit(): Promise<void> {
    if (this.busy) return;
    this.error = '';
    if (
      !this.currentPassword ||
      this.password.length < 12 ||
      !/[a-z]/.test(this.password) ||
      !/[A-Z]/.test(this.password) ||
      !/\d/.test(this.password)
    ) {
      this.error =
        'Use your temporary password and choose a new password with at least 12 characters, including upper- and lowercase letters and a number.';
      return;
    }
    if (this.password !== this.confirmation) {
      this.error = 'The new passwords do not match.';
      return;
    }

    this.busy = true;
    try {
      await this.auth.changePassword(this.currentPassword, this.password, this.confirmation);
      this.ui.toast('Your password has been changed.');
      if (!this.auth.role) throw new Error('Your account does not have an assigned portal role.');
      await this.router.navigateByUrl(HOME[this.auth.role]);
    } catch (error) {
      const response = (
        error as { error?: { message?: string; errors?: Record<string, string[]> } }
      )?.error;
      this.error = response?.errors
        ? Object.values(response.errors).flat()[0]
        : response?.message ||
          (error instanceof Error ? error.message : 'Your password could not be changed.');
    } finally {
      this.busy = false;
      this.cdr.markForCheck();
    }
  }
}
