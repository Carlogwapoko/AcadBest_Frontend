import { Component,effect,EffectRef,OnDestroy } from '@angular/core';
import { UiService } from '../../../core/ui.service';
import { OverlayService } from '../../../core/overlay.service';
import { IconComponent } from '../icon/icon.component';

/** Global host for toasts and confirmation dialogs. */
@Component({selector:'app-ui-host',standalone:true,imports:[IconComponent],styleUrl:'./ui-host.component.css',templateUrl:'./ui-host.component.html'})
export class UiHostComponent implements OnDestroy{
  private releaseScrollLock:(()=>void)|null=null;
  private scrollEffect:EffectRef;
  constructor(public ui:UiService,private overlays:OverlayService){
    this.scrollEffect=effect(()=>{
      if(this.ui.confirmState()){
        if(!this.releaseScrollLock)this.releaseScrollLock=this.overlays.acquireScrollLock();
      }else this.restoreScroll();
    });
  }
  ngOnDestroy(){this.scrollEffect.destroy();this.restoreScroll()}
  private restoreScroll(){
    this.releaseScrollLock?.();
    this.releaseScrollLock=null;
  }
}
