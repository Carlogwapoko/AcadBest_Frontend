import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { AuthService } from '../../core/auth.service';
import { DataService, ROLE_NAME } from '../../core/data.service';
import { NAV } from '../../core/nav';
import { UiService } from '../../core/ui.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  styleUrl: './shell.component.css',
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  open = false;
  moreOpen = false;
  profileOpen = false;
  title = '';
  private portalRefreshInProgress = false;
  @ViewChild('profileTrigger') profileTrigger?: ElementRef<HTMLButtonElement>;
  constructor(
    public auth: AuthService,
    public d: DataService,
    private router: Router,
    private ui: UiService,
    private destroyRef: DestroyRef,
    private cdr: ChangeDetectorRef,
  ) {
    void this.d
      .load()
      .catch((error) => {
        console.error('Could not load AcadBest portal data.', error);
        this.ui.toast(this.d.loadError, 'er');
      })
      .finally(() => this.cdr.markForCheck());
    const notificationTimer = setTimeout(() => {
      if (this.unread)
        this.ui.toast(`You have ${this.unread} new notification${this.unread > 1 ? 's' : ''}.`);
    }, 700);
    this.destroyRef.onDestroy(() => clearTimeout(notificationTimer));
    const notificationPoller = setInterval(() => {
      void this.d
        .refreshNotifications()
        .catch((error) => {
          console.error('Could not refresh AcadBest notifications.', error);
        })
        .finally(() => this.cdr.markForCheck());
      if (this.auth.role === 'student') this.refreshStudentPortal();
    }, 10000);
    this.destroyRef.onDestroy(() => clearInterval(notificationPoller));
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        let current = this.router.routerState.snapshot.root;
        while (current.firstChild) current = current.firstChild;
        this.title = current.data['title'] || '';
        this.cdr.markForCheck();
      });
  }
  private refreshStudentPortal() {
    if (this.portalRefreshInProgress || document.visibilityState !== 'visible') return;
    this.portalRefreshInProgress = true;
    void this.d
      .reload()
      .catch((error) => {
        console.error('Could not refresh AcadBest student portal data.', error);
      })
      .finally(() => {
        this.portalRefreshInProgress = false;
        this.cdr.markForCheck();
      });
  }
  get nav() {
    const role = this.auth.role;
    return role ? NAV[role].filter((n) => this.d.moduleOn(role, n.key)) : [];
  }
  mobileLabel(item: { key: string; label: string }) {
    return (
      (
        {
          dash: 'Dashboard',
          gs: 'Grades',
          sr: 'Requests',
          ann: 'News',
          subj: 'Subjects',
          ge: 'Grades',
          risk: 'Advisees',
          sec: 'Sections',
          rq: 'Requests',
          en: 'Enroll',
          su: 'Subjects',
          pa: 'News',
          ur: 'Users',
          ay: 'School Year',
          sr2: 'Rules',
          ac: 'Access',
        } as Record<string, string>
      )[item.key] || item.label
    );
  }
  get primaryNav() {
    return this.auth.role === 'registrar' || this.auth.role === 'admin'
      ? this.nav
      : this.nav.slice(0, 4);
  }
  get moreNav() {
    return this.auth.role === 'registrar' || this.auth.role === 'admin' ? [] : this.nav.slice(4);
  }
  get moreActive() {
    const url = this.router.url.replace(/[?#].*$/, '').replace(/\/$/, '');
    return this.moreNav.some(({ path }) => {
      const target = `/app/${path}`;
      return url === target || url.startsWith(`${target}/`);
    });
  }
  get unread() {
    const user = this.auth.user;
    if (this.auth.role === 'student' && user?.sid) return this.d.unread(user.sid);
    return user ? this.d.unreadForUser(user.id) : 0;
  }
  get notificationRoute() {
    return this.auth.role === 'student' ? '/app/student/notifications' : '/app/notifications';
  }
  get roleName() {
    const role = this.auth.role;
    return role ? ROLE_NAME[role] : '';
  }
  retry() {
    void this.d
      .load()
      .catch((error) => {
        console.error('Could not load AcadBest portal data.', error);
        this.ui.toast(this.d.loadError, 'er');
      })
      .finally(() => this.cdr.markForCheck());
  }
  get initials() {
    const name = this.auth.user?.name;
    if (!name) return '';
    return name
      .replace(/^(Prof\.|Dr\.)\s*/, '')
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
  @HostListener('document:keydown.escape') closeMenu() {
    const focusProfile = this.profileOpen;
    this.open = false;
    this.moreOpen = false;
    this.profileOpen = false;
    if (focusProfile) this.profileTrigger?.nativeElement.focus();
  }
  @HostListener('document:click', ['$event']) closeProfileOnOutsideClick(event: MouseEvent) {
    if (
      this.profileOpen &&
      !this.profileTrigger?.nativeElement.parentElement?.contains(event.target as Node)
    ) {
      this.profileOpen = false;
    }
  }
  async logout() {
    if (this.d.pendingOperations) {
      this.ui.toast(
        'A submission is still in progress. Wait for it to finish before logging out.',
        'er',
      );
      return;
    }
    if (
      !(await this.ui.confirm(
        'Log out?',
        'You will be signed out. Any unsaved form changes will be discarded.',
        'Log Out',
      ))
    )
      return;
    try {
      await this.auth.logout();
      this.ui.toast('You have been logged out.');
    } catch (error) {
      const message = (error as { error?: { message?: string } })?.error?.message;
      this.ui.toast(
        message || 'The server could not confirm sign out. Your local session was cleared.',
        'er',
      );
    } finally {
      this.ui.cancelConfirmations();
      await this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }
}
