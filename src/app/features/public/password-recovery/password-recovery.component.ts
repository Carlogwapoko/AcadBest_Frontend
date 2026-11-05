import { ChangeDetectorRef,Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute,RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../core/api-config';
import { COMMON } from '../../../shared/common';

@Component({
  selector:'app-password-recovery',
  standalone:true,
  imports:[COMMON,RouterLink],
  templateUrl:'./password-recovery.component.html',
  styleUrl:'./password-recovery.component.css',
})
export class PasswordRecoveryComponent{
  email='';
  token='';
  password='';
  passwordConfirmation='';
  error='';
  success='';
  busy=false;
  readonly isReset:boolean;

  constructor(
    private http:HttpClient,
    private route:ActivatedRoute,
    private cdr:ChangeDetectorRef,
  ){
    this.isReset=this.route.snapshot.routeConfig?.path==='reset-password';
    this.token=this.route.snapshot.queryParamMap.get('token')??'';
    this.email=this.route.snapshot.queryParamMap.get('email')??'';
  }

  async submit():Promise<void>{
    if(this.busy)return;
    this.error='';
    this.success='';

    if(!this.email.trim()){
      this.error='Enter your email address.';
      return;
    }

    if(this.isReset){
      if(!this.token){
        this.error='This password reset link is invalid or has expired.';
        return;
      }
      if(this.password.length<8){
        this.error='Your password must be at least 8 characters.';
        return;
      }
      if(this.password!==this.passwordConfirmation){
        this.error='The password confirmation does not match.';
        return;
      }
    }

    this.busy=true;
    try{
      if(this.isReset){
        await firstValueFrom(this.http.post(`${API_BASE_URL}/auth/reset-password`,{
          token:this.token,
          email:this.email.trim(),
          password:this.password,
          password_confirmation:this.passwordConfirmation,
        }));
        this.success='Your password has been reset. You can now log in with your new password.';
      }else{
        const response=await firstValueFrom(this.http.post<{message:string}>(
          `${API_BASE_URL}/auth/forgot-password`,{email:this.email.trim()},
        ));
        this.success=response.message;
      }
    }catch(error){
      const response=(error as {error?:{message?:string;errors?:Record<string,string[]>}})?.error;
      this.error=response?.errors?.['email']?.[0]
        ||response?.errors?.['password']?.[0]
        ||response?.errors?.['token']?.[0]
        ||response?.message
        ||'We could not complete your request. Please try again.';
    }finally{
      this.busy=false;
      this.cdr.markForCheck();
    }
  }
}
