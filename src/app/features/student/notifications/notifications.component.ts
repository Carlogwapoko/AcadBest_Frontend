import { Component } from '@angular/core';
import { COMMON } from '../../../shared/common';
import { AuthService } from '../../../core/auth.service';
import { DataService,Notif } from '../../../core/data.service';
import { UiService } from '../../../core/ui.service';

/** Student notifications: grade postings and academic (grade) alerts created when faculty save grades. */
@Component({selector:'app-student-notifications',standalone:true,imports:[COMMON],
  styleUrl:'./notifications.component.css',templateUrl:'./notifications.component.html'})
export class StudentNotificationsComponent{
  markingAll=false;
  constructor(public d:DataService,private a:AuthService,private ui:UiService){}
  get sid(){return this.a.user!.sid!}
  get list(){return this.d.notifications.filter(n=>n.sid==this.sid)}
  get unread(){return this.d.unread(this.sid)}
  async read(n:Notif){if(n.read)return;try{await this.d.markRead(n.id)}
    catch(error){this.ui.toast((error as {error?:{message?:string}})?.error?.message
      ||(error instanceof Error?error.message:'Notification could not be marked read.'),'er')}}
  async markAll(){if(this.markingAll||!this.unread)return;this.markingAll=true;
    try{await this.d.markAllRead(this.sid);this.ui.toast('All notifications marked as read.')}
    catch(error){this.ui.toast((error as {error?:{message?:string}})?.error?.message
      ||(error instanceof Error?error.message:'Notifications could not be updated.'),'er')}
    finally{this.markingAll=false}
  }
}
