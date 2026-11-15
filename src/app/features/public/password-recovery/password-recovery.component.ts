import { ChangeDetectorRef, Component, ElementRef, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../core/api-config';
import { COMMON } from '../../../shared/common';

interface OtpRequestResponse {
  message: string;
  expires_in: number;
  resend_after: number;
}

interface OtpVerificationResponse {
  message: string;
  reset_token: string;
}

@Component({
  selector: 'app-password-recovery',
  standalone: true,
  imports: [COMMON, RouterLink],
  templateUrl: './password-recovery.component.html',
  styleUrl: './password-recovery.component.css',
})
export class PasswordRecoveryComponent implements OnDestroy {
  @ViewChildren('otpInput') private otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  email = '';
  password = '';
  passwordConfirmation = '';
  otpDigits = ['', '', '', '', '', ''];
  resetToken = '';
  step: 'email' | 'otp' | 'password' | 'complete' = 'email';
  showPassword = false;
  showPasswordConfirmation = false;
  error = '';
  success = '';
  busy = false;
  expiresIn = 0;
  resendIn = 0;
  private countdownTimer?: ReturnType<typeof setInterval>;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  async requestOtp(): Promise<void> {
    if (this.busy) return;
    this.error = '';
    this.success = '';

    const email = this.email.trim().toLowerCase();
    if (!email) {
      this.error = 'Enter your email address.';
      return;
    }

    this.busy = true;
    try {
      const response = await firstValueFrom(
        this.http.post<OtpRequestResponse>(`${API_BASE_URL}/auth/forgot-password`, { email }),
      );
      this.email = email;
      this.step = 'otp';
      this.startCountdown(response.expires_in, response.resend_after);
      this.success = response.message;
    } catch (error) {
      this.showRequestError(error);
    } finally {
      this.busy = false;
      this.cdr.markForCheck();
    }
  }

  async resendOtp(): Promise<void> {
    if (this.busy || this.resendIn > 0) return;
    this.error = '';
    this.success = '';
    this.busy = true;

    try {
      const response = await firstValueFrom(
        this.http.post<OtpRequestResponse>(`${API_BASE_URL}/auth/resend-password-reset-otp`, {
          email: this.email,
        }),
      );
      this.otpDigits = ['', '', '', '', '', ''];
      this.startCountdown(response.expires_in, response.resend_after);
      this.success = response.message;
      this.cdr.markForCheck();
      this.otpInputs.first?.nativeElement.focus();
    } catch (error) {
      this.showRequestError(error);
    } finally {
      this.busy = false;
      this.cdr.markForCheck();
    }
  }

  async verifyOtp(): Promise<void> {
    if (this.busy) return;
    this.error = '';
    this.success = '';
    const otp = this.otpDigits.join('');
    if (!/^\d{6}$/.test(otp)) {
      this.error = 'Enter the complete 6-digit verification code.';
      return;
    }

    this.busy = true;
    try {
      const response = await firstValueFrom(
        this.http.post<OtpVerificationResponse>(
          `${API_BASE_URL}/auth/verify-password-reset-otp`,
          { email: this.email, otp },
        ),
      );
      this.resetToken = response.reset_token;
      this.step = 'password';
      this.success = '';
    } catch (error) {
      this.showRequestError(error);
    } finally {
      this.busy = false;
      this.cdr.markForCheck();
    }
  }

  async resetPassword(): Promise<void> {
    if (this.busy) return;
    this.error = '';
    this.success = '';

    if (this.password.length < 12) {
      this.error = 'Your password must be at least 12 characters and include uppercase, lowercase, and numeric characters.';
      return;
    }
    if (this.password !== this.passwordConfirmation) {
      this.error = 'The password confirmation does not match.';
      return;
    }

    this.busy = true;
    try {
      await firstValueFrom(
        this.http.post(`${API_BASE_URL}/auth/reset-password`, {
          email: this.email,
          reset_token: this.resetToken,
          password: this.password,
          password_confirmation: this.passwordConfirmation,
        }),
      );
      this.step = 'complete';
      this.stopCountdown();
      this.success = 'Your password has been reset. You can now log in with your new password.';
    } catch (error) {
      this.showRequestError(error);
    } finally {
      this.busy = false;
      this.cdr.markForCheck();
    }
  }

  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, this.otpDigits.length - index);
    if (digits.length > 1) {
      for (let offset = 0; offset < digits.length; offset++) {
        this.otpDigits[index + offset] = digits[offset];
      }
      this.otpInputs.get(Math.min(index + digits.length, this.otpDigits.length - 1))?.nativeElement.focus();
    } else {
      this.otpDigits[index] = digits;
      if (digits && index < this.otpDigits.length - 1) {
        this.otpInputs.get(index + 1)?.nativeElement.focus();
      }
    }
    input.value = this.otpDigits[index];
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const digits = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? '';
    this.otpDigits = Array.from({ length: 6 }, (_, index) => digits[index] ?? '');
    this.otpInputs.get(Math.min(digits.length, 5))?.nativeElement.focus();
  }

  onOtpKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      this.otpInputs.get(index - 1)?.nativeElement.focus();
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.otpInputs.get(index - 1)?.nativeElement.focus();
    } else if (event.key === 'ArrowRight' && index < this.otpDigits.length - 1) {
      event.preventDefault();
      this.otpInputs.get(index + 1)?.nativeElement.focus();
    }
  }

  backToEmail(): void {
    this.stopCountdown();
    this.step = 'email';
    this.otpDigits = ['', '', '', '', '', ''];
    this.resetToken = '';
    this.error = '';
    this.success = '';
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes}:${remainder.toString().padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    this.stopCountdown();
  }

  private startCountdown(expiresIn: number, resendIn: number): void {
    this.stopCountdown();
    this.expiresIn = expiresIn;
    this.resendIn = resendIn;
    this.countdownTimer = setInterval(() => {
      this.expiresIn = Math.max(0, this.expiresIn - 1);
      this.resendIn = Math.max(0, this.resendIn - 1);
      this.cdr.markForCheck();
      if (this.expiresIn === 0) this.stopCountdown();
    }, 1000);
  }

  private stopCountdown(): void {
    if (this.countdownTimer !== undefined) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = undefined;
    }
  }

  private showRequestError(error: unknown): void {
    const response = error as {
      status?: number;
      error?: { message?: string; errors?: Record<string, string[]> };
    };
    this.error =
      response.error?.errors?.['email']?.[0] ||
      response.error?.errors?.['otp']?.[0] ||
      response.error?.errors?.['password']?.[0] ||
      (response.status === 429
        ? 'Too many attempts. Please wait a moment before trying again.'
        : response.error?.message) ||
      'We could not complete your request. Please try again.';
  }
}
