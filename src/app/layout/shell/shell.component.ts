import { Component,DestroyRef,HostListener } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd,Router,RouterLink,RouterLinkActive,RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { AuthService } from '../../core/auth.service';
import { DataService,ROLE_NAME } from '../../core/data.service';
import { NAV } from '../../core/nav';
import { UiService } from '../../core/ui.service';

@Component({selector:'app-shell',standalone:true,imports:[RouterOutlet,RouterLink,
  RouterLinkActive,IconComponent],styleUrl:'./shell.component.css',templateUrl:'./shell.component.html'})
export class ShellComponent{
  open=false;title='';
  constructor(public auth:AuthService,public d:DataService,private router:Router,
    private ui:UiService,private destroyRef:DestroyRef){
    void this.d.load().catch(error=>{
      console.error('Could not load AcadBest portal data.',error);
      this.ui.toast(this.d.loadError,'er');
    });
    const notificationTimer=setTimeout(()=>{
      if(this.unread)this.ui.toast(`You have ${this.unread} new notification${this.unread>1?'s':''}.`);
    },700);
    this.destroyRef.onDestroy(()=>clearTimeout(notificationTimer));
    this.router.events.pipe(filter(e=>e instanceof NavigationEnd),takeUntilDestroyed(this.destroyRef)).subscribe(()=>{
      let current=this.router.routerState.snapshot.root;
      while(current.firstChild)current=current.firstChild;
      this.title=current.data['title']||'';
    });
  }
  get nav(){const role=this.auth.role;return role?NAV[role].filter(n=>this.d.moduleOn(role,n.key)):[]}
  get unread(){const sid=this.auth.user?.sid;return this.auth.role==='student'&&sid?this.d.unread(sid):0}
  get roleName(){const role=this.auth.role;return role?ROLE_NAME[role]:''}
  retry(){void this.d.load().catch(error=>{console.error('Could not load AcadBest portal data.',error);
    this.ui.toast(this.d.loadError,'er')})}
  get initials(){const name=this.auth.user?.name;if(!name)return '';
    return name.replace(/^(Prof\.|Dr\.)\s*/,'').split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase()}
  @HostListener('document:keydown.escape') closeMenu(){this.open=false}
  async logout(){
    if(this.d.pendingOperations){
      this.ui.toast('A submission is still in progress. Wait for it to finish before logging out.','er');
      return;
    }
    if(!await this.ui.confirm('Log out?','You will be signed out. Any unsaved form changes will be discarded.',
      'Log Out'))return;
    try{
      await this.auth.logout();
      this.ui.toast('You have been logged out.');
    }catch(error){
      const message=(error as {error?:{message?:string}})?.error?.message;
      this.ui.toast(message||'The server could not confirm sign out. Your local session was cleared.','er');
    }finally{
      await this.router.navigateByUrl('/login',{replaceUrl:true});
    }
  }
}
