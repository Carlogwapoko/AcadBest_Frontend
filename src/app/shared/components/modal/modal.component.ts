import { Component,EventEmitter,HostListener,Input,OnChanges,OnDestroy,Output,SimpleChanges } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { OverlayService } from '../../../core/overlay.service';


@Component({selector:'app-modal',standalone:true,imports:[IconComponent],styleUrl:'./modal.component.css',templateUrl:'./modal.component.html'})
export class ModalComponent implements OnChanges,OnDestroy{
  @Input() open=false;@Input() title='';@Input() maxWidth=560;@Output() closed=new EventEmitter<void>();
  private releaseScrollLock:(()=>void)|null=null;
  constructor(private overlays:OverlayService){}
  ngOnChanges(changes:SimpleChanges){
    if(!changes['open'])return;
    if(this.open){
      if(!this.releaseScrollLock)this.releaseScrollLock=this.overlays.acquireScrollLock();
    }else this.restoreScroll();
  }
  ngOnDestroy(){this.restoreScroll()}
  private restoreScroll(){
    this.releaseScrollLock?.();
    this.releaseScrollLock=null;
  }
  back(e:Event){if((e.target as HTMLElement).classList.contains('modal'))this.closed.emit()}
  @HostListener('document:keydown.escape') esc(){if(this.open)this.closed.emit()}
}
