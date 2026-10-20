import { Injectable,signal } from '@angular/core';
export interface Toast{id:number;kind:'ok'|'er';msg:string}
interface ConfirmState{title:string;msg:string;label:string;danger:boolean;resolve:(answer:boolean)=>void}
/** UI helpers for toasts and confirmation dialogs. */
@Injectable({providedIn:'root'})
export class UiService{
  toasts=signal<Toast[]>([]);confirmState=signal<ConfirmState|null>(null);private n=0;
  toast(msg:string,kind:'ok'|'er'='ok'){const id=++this.n;this.toasts.update(items=>[...items,{id,kind,msg}]);
    setTimeout(()=>this.toasts.update(items=>items.filter(t=>t.id!==id)),3800)}
  confirm(title:string,msg:string,label='Confirm',danger=false):Promise<boolean>{return new Promise(resolve=>
    this.confirmState.set({title,msg,label,danger,resolve}))}
  answer(answer:boolean){const current=this.confirmState();current?.resolve(answer);this.confirmState.set(null)}
}
