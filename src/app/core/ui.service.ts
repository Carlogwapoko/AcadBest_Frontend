import { Injectable,signal } from '@angular/core';
export interface Toast{id:number;kind:'ok'|'er';msg:string}
interface ConfirmState{title:string;msg:string;label:string;danger:boolean;resolve:(answer:boolean)=>void}
/** UI helpers for toasts and confirmation dialogs. */
@Injectable({providedIn:'root'})
export class UiService{
  toasts=signal<Toast[]>([]);confirmState=signal<ConfirmState|null>(null);private n=0;
  private confirmQueue:ConfirmState[]=[];
  toast(msg:string,kind:'ok'|'er'='ok'){const id=++this.n;this.toasts.update(items=>[...items,{id,kind,msg}]);
    setTimeout(()=>this.toasts.update(items=>items.filter(t=>t.id!==id)),3800)}
  confirm(title:string,msg:string,label='Confirm',danger=false):Promise<boolean>{return new Promise(resolve=>{
    const confirmation={title,msg,label,danger,resolve};
    if(this.confirmState())this.confirmQueue.push(confirmation);
    else this.confirmState.set(confirmation);
  })}
  answer(answer:boolean){const current=this.confirmState();if(!current)return;
    current.resolve(answer);this.confirmState.set(this.confirmQueue.shift()??null)}
  cancelConfirmations(){const current=this.confirmState();current?.resolve(false);
    this.confirmQueue.splice(0).forEach(confirmation=>confirmation.resolve(false));
    this.confirmState.set(null)}
}
