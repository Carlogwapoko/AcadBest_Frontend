import { Component,Input,OnChanges } from '@angular/core';
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';
import { IC } from '../../icons';

@Component({selector:'app-icon',standalone:true,styleUrl:'./icon.component.css',templateUrl:'./icon.component.html'})
export class IconComponent implements OnChanges{
  @Input() name='grid';@Input() size=18;svg:SafeHtml='';
  constructor(private s:DomSanitizer){}
  ngOnChanges(){this.svg=this.s.bypassSecurityTrustHtml(`<svg width='${this.size}' height='${this.size}' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'>${IC[this.name]||''}</svg>`)}
}
