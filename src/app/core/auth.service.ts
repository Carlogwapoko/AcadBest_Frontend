import { Injectable } from '@angular/core';
import { HttpClient,HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DataService,ROLE_KEY,Role,User } from './data.service';
import { API_BASE_URL } from './api-config';

const TOKEN_KEY='acadbest.api_token';

@Injectable({providedIn:'root'})
export class AuthService{
  user:User|null=null;
  restoreError='';
  private restorePromise:Promise<void>|null=null;
  constructor(private http:HttpClient,private data:DataService){}
  get role():Role|null{return this.user?this.user.roleKey??ROLE_KEY[this.user.role]??null:null}
  get student(){return this.data.students.find(s=>s.id===this.user?.sid)}

  async login(email:string,password:string):Promise<void>{
    const result=await firstValueFrom(this.http.post<{token:string;user:Record<string,unknown>}>(
      `${API_BASE_URL}/auth/login`,{email:email.trim().toLowerCase(),password}));
    localStorage.setItem(TOKEN_KEY,result.token);
    this.data.reset();
    this.user=this.mapUser(result.user);
    this.restoreError='';
  }

  async restore():Promise<void>{
    if(this.user)return;
    if(this.restorePromise)return this.restorePromise;
    if(!localStorage.getItem(TOKEN_KEY))return;
    this.restorePromise=(async()=>{
      try{
        const result=await firstValueFrom(this.http.get<{user:Record<string,unknown>}>(`${API_BASE_URL}/auth/me`));
        this.user=this.mapUser(result.user);
        this.restoreError='';
      }catch(error){
        this.user=null;
        if(error instanceof HttpErrorResponse&&(error.status===401||error.status===403)){
          localStorage.removeItem(TOKEN_KEY);
        }else{
          this.restoreError='AcadBest could not restore your session because the server is unavailable. Please try again.';
        }
        console.error('The saved AcadBest session could not be restored.',error);
      }finally{this.restorePromise=null}
    })();
    return this.restorePromise;
  }

  async logout():Promise<void>{
    try{if(localStorage.getItem(TOKEN_KEY))await firstValueFrom(this.http.post(`${API_BASE_URL}/auth/logout`,{}))}
    finally{this.user=null;this.restoreError='';this.data.reset();localStorage.removeItem(TOKEN_KEY)}
  }

  private mapUser(value:Record<string,unknown>):User{
    const roleKey=value['role_key'];
    return {id:Number(value['id']),name:String(value['name']),middle_name:String(value['middle_name']??''),email:String(value['email']),
      role:String(value['role']),roleKey:this.isRole(roleKey)?roleKey:undefined,
      act:Boolean(value['active']),phone:String(value['phone']??''),
      sid:value['student_id']?Number(value['student_id']):undefined,
      schoolId:typeof value['school_id']==='string'?value['school_id']:undefined,
      avatar:typeof value['avatar']==='string'?value['avatar']:undefined,
      prog:typeof value['program']==='string'?value['program']:undefined,
      yr:value['year_level']?Number(value['year_level']):undefined};
  }

  private isRole(value:unknown):value is Role{
    return value==='student'||value==='faculty'||value==='registrar'||value==='admin';
  }
}
