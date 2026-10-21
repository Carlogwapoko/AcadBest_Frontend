import { ChangeDetectorRef,Component } from '@angular/core';
import { Router,RouterLink } from '@angular/router';
import { COMMON } from '../../../shared/common';
import { AuthService } from '../../../core/auth.service';
import { HOME } from '../../../core/nav';
import { UiService } from '../../../core/ui.service';

// ---------------------------------------------------------------- Login
@Component({selector:'app-login',standalone:true,imports:[COMMON,RouterLink],styleUrl:'./login.component.css',templateUrl:'./login.component.html'})
export class LoginComponent{
  email='';pw='';err='';busy=false;showPassword=false;
  constructor(private auth:AuthService,private ui:UiService,private router:Router,private cdr:ChangeDetectorRef){}
  async go(){
    if(this.busy)return;
    this.err='';
    if(!this.email.trim()||!this.pw){
      this.err='Enter your email address and password.';
      return;
    }
    this.busy=true;
    try{
      await this.auth.login(this.email.trim(),this.pw);
      if(!this.auth.role||!this.auth.user)throw new Error('Your account does not have an assigned portal role.');
      this.ui.toast('Welcome, '+this.auth.user.name.split(' ')[0]+'!');
      await this.router.navigateByUrl(HOME[this.auth.role]);
    }catch(error){
      const response=(error as {error?:{message?:string;errors?:Record<string,string[]>}})?.error;
      this.err=response?.errors?.['email']?.[0]||response?.message
        ||(error instanceof Error?error.message:'Sign in failed. Please try again.');
    }finally{this.busy=false;this.cdr.markForCheck()}
  }
}
