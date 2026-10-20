import { inject } from '@angular/core';
import { CanActivateFn,Router } from '@angular/router';
import { DataService } from './data.service';
import { AuthService } from './auth.service';
import { Role } from './data.service';
import { HOME } from './nav';
import { UiService } from './ui.service';
export const authGuard:CanActivateFn=async()=>{
  const a=inject(AuthService),r=inject(Router),u=inject(UiService);
  if(!a.user)await a.restore();
  if(!a.user&&a.restoreError)u.toast(a.restoreError,'er');
  return a.user?true:r.parseUrl('/login');
};
/** Blocks users from opening pages that belong to another role. */
export const roleGuard=(role:Role):CanActivateFn=>()=>{
  const a=inject(AuthService),r=inject(Router),u=inject(UiService);
  if(a.role===role)return true;
  if(a.role){u.toast('You are not authorized to open that page.','er');return r.parseUrl(HOME[a.role])}
  return r.parseUrl('/login');
};
/** Blocks a module the administrator switched off for this role (Access Control). */
export const moduleGuard=(role:Role,key:string):CanActivateFn=>()=>{
  const d=inject(DataService),r=inject(Router),u=inject(UiService);
  if(d.moduleOn(role,key))return true;
  u.toast('This module has been disabled for your role by the administrator.','er');
  return r.parseUrl(HOME[role]);
};
