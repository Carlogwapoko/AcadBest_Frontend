import { ChangeDetectorRef, Component } from '@angular/core';
import { AuthService } from '../../../core/auth.service';
import { DataService, Notif } from '../../../core/data.service';
import { UiService } from '../../../core/ui.service';
import { COMMON } from '../../common';

@Component({
  selector: 'app-portal-notifications',
  standalone: true,
  imports: [COMMON],
  templateUrl: './portal-notifications.component.html',
  styleUrl: './portal-notifications.component.css',
})
export class PortalNotificationsComponent {
  reading = new Set<number>();
  markingAll = false;
  error = '';

  constructor(
    public auth: AuthService,
    public d: DataService,
    private ui: UiService,
    private cdr: ChangeDetectorRef,
  ) {}

  get list(): Notif[] {
    const userId = this.auth.user?.id;
    return userId ? this.d.notifications.filter(item => item.user_id === userId) : [];
  }

  get unread(): number {
    return this.list.filter(item => !item.read).length;
  }

  async read(notification: Notif): Promise<void> {
    if (notification.read || this.reading.has(notification.id)) return;
    this.reading.add(notification.id);
    this.error = '';
    try {
      if (notification.announcement_id) {
        await this.d.markAnnouncementRead(notification.announcement_id);
      } else {
        await this.d.markRead(notification.id);
      }
    } catch (error) {
      this.error = this.message(error, 'Notification could not be marked as read.');
    } finally {
      this.reading.delete(notification.id);
      this.cdr.markForCheck();
    }
  }

  async markAll(): Promise<void> {
    const userId = this.auth.user?.id;
    if (!userId || !this.unread || this.markingAll) return;
    this.markingAll = true;
    this.error = '';
    try {
      await this.d.markAllForUser(userId);
      this.ui.toast('All notifications marked as read.');
    } catch (error) {
      this.error = this.message(error, 'Notifications could not be updated.');
    } finally {
      this.markingAll = false;
      this.cdr.markForCheck();
    }
  }

  private message(error: unknown, fallback: string): string {
    return (error as { error?: { message?: string } })?.error?.message
      || (error instanceof Error ? error.message : fallback);
  }
}
