import { ChangeDetectorRef,Component,HostListener } from '@angular/core';
import { COMMON } from '../../../shared/common';
import { AuthService } from '../../../core/auth.service';
import { DataService,User } from '../../../core/data.service';
import { processProfilePicture } from '../../../core/profile-picture';
import { UiService } from '../../../core/ui.service';

/**
 * Admin-only account provisioning.
 *  - "Add Users": staff accounts (Faculty, Registrar Staff, Admin) – always created Active.
 *  - "Create Account": Student accounts, only for online applicants the registrar has approved. Role is locked to Student.
 */
@Component({selector:'app-users-roles',standalone:true,imports:[COMMON],styleUrl:'./users-roles.component.css',templateUrl:'./users-roles.component.html'})
export class UsersRolesComponent{
  q='';m:any=null;e:any={};processingPicture=false;saving=false;deletingId:number|null=null;showPassword=false;
  page=1;lastPage=1;total=0;loading=true;loadError='';private searchTimer?:ReturnType<typeof setTimeout>;
  constructor(public d:DataService,private a:AuthService,private ui:UiService,private cdr:ChangeDetectorRef){}
  ngOnInit(){void this.loadUsers()}
  ngOnDestroy(){if(this.searchTimer)clearTimeout(this.searchTimer)}
  async loadUsers(page=1){if(this.loading&&page>this.page)return;this.loading=true;this.loadError='';
    try{const result=await this.d.usersList(page,this.q,page>1);this.page=result.current_page;
      this.lastPage=result.last_page;this.total=result.total}
    catch(error){this.loadError=this.message(error)}
    finally{this.loading=false;this.cdr.detectChanges();this.loadMoreIfNeeded()}}
  @HostListener('window:scroll') onWindowScroll(){this.loadMoreIfNeeded()}
  private loadMoreIfNeeded(){
    if(!this.loading&&this.page<this.lastPage
      &&window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-300)
      void this.loadUsers(this.page+1);
  }
  searchChanged(){if(this.searchTimer)clearTimeout(this.searchTimer);
    this.searchTimer=setTimeout(()=>void this.loadUsers(1),300)}
  get list(){return this.d.users}
  avatarInitials(name:string){return name.replace(/^(Prof\.|Dr\.)\s*/,'').split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase()}
  formName(){return [this.m?.first_name,this.m?.middle_name,this.m?.last_name].filter(Boolean).join(' ')}
  open(u?:User|null){
    this.e={};this.showPassword=false;
    this.m=u?{id:u.id,first_name:u.first_name||'',middle_name:u.middle_name||'',last_name:u.last_name||'',
      email:u.email,role:u.role,status:u.act?'Active':'Inactive',
      pw:'',prog:u.prog||'BSTM',lock:u.role=='Student',avatar:u.avatar??null}
      :{id:0,first_name:'',middle_name:'',last_name:'',
        email:'',role:'Faculty',status:'Active',pw:'',prog:'BSTM',lock:false,avatar:null}}
  async selectPicture(event:Event){
    const input=event.target as HTMLInputElement;
    const file=input.files?.[0];
    if(!file)return;
    if(this.a.role!=='admin'||!this.m?.id){
      this.ui.toast('Only an administrator can manage profile pictures for existing accounts.','er');
      input.value='';return;
    }
    this.processingPicture=true;
    try{this.m.avatar=await processProfilePicture(file)}
    catch(error){this.ui.toast(error instanceof Error?error.message:'Could not process this image.','er')}
    finally{this.processingPicture=false;this.cdr.markForCheck();input.value=''}
  }
  removePicture(){if(this.m)this.m.avatar=null}
  async save(){if(this.saving||!this.m)return;const m=this.m,em=m.email.trim().toLowerCase(),old=m.id?this.d.users.find(x=>x.id==m.id)!:null;
    this.e={first:m.first_name.trim().length<2?'First name is required.':'',
      last:m.last_name.trim().length<2?'Last name is required.':'',
      e:!/^\S+@\S+\.\S+$/.test(em)?'Enter a valid e-mail.':this.d.users.some(x=>x.email==em&&x.id!=m.id)?'E-mail already in use.':'',
      p:(!m.id||m.pw)&&m.pw.length<8?'Password must be at least 8 characters.':''};
    if(Object.values(this.e).some(x=>x))return;
    const act=m.id?m.status=='Active':true;
    this.saving=true;
    if(old&&(old.role!=m.role||(old.act&&!act))&&!await this.ui.confirm('Confirm important change',
      `${old.name}: ${old.role!=m.role?`role changes from ${old.role} to ${m.role}. `:''}${old.act&&!act?'Account will be deactivated.':''}`,
      'Apply Change')){this.saving=false;this.cdr.markForCheck();return}
    const payload:Record<string,unknown>={first_name:m.first_name.trim(),middle_name:m.middle_name.trim(),
      last_name:m.last_name.trim(),email:em,role:m.role,
      phone:old?.phone||'',program:m.prog||'BSTM'};
    if(old)payload['active']=act;
    if(m.pw)payload['password']=m.pw;
    if(old&&(old.avatar??null)!==m.avatar)payload['avatar_data']=m.avatar;
    try{
      const user=await this.d.saveUser(old?.id,payload);
      if(this.a.user?.id===user.id)Object.assign(this.a.user,user);
      if(!old)this.total++;
      this.ui.toast(old?'Account updated.':`Account created for ${user.name}. Give the e-mail and temporary password to the user.`);
      this.m=null;
    }catch(error){this.ui.toast(this.message(error),'er')}
    finally{this.saving=false;this.cdr.detectChanges()}
  }
  async del(u:User){if(u.id==this.a.user!.id)return this.ui.toast('You cannot delete your own account.','er');
    if(this.deletingId!==null)return;
    this.deletingId=u.id;
    if(!await this.ui.confirm('Delete user?',`${u.name} will be permanently removed.`,
      'Delete',true)){this.deletingId=null;this.cdr.markForCheck();return}
    try{await this.d.deleteUser(u.id);this.total=Math.max(0,this.total-1);
      this.lastPage=Math.max(1,Math.ceil(this.total/25));this.ui.toast('User deleted.');
      if(!this.d.users.length&&this.page>1)await this.loadUsers(this.page-1)}
    catch(error){this.ui.toast(this.message(error),'er')}
    finally{this.deletingId=null;this.cdr.detectChanges()}}
  private message(error:unknown){
    const value=(error as {error?:{message?:string;errors?:Record<string,string[]>}})?.error;
    return value?.errors?Object.values(value.errors).flat()[0]:value?.message
      ||(error instanceof Error?error.message:'The account could not be saved.');
  }
}
