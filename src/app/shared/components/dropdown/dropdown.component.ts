import { AfterViewInit,Component,DoCheck,ElementRef,HostBinding,HostListener,Input,OnDestroy,Renderer2,ViewChild } from '@angular/core';
import { ControlValueAccessor,NG_VALUE_ACCESSOR } from '@angular/forms';

interface DropdownOption{value:string;label:string;disabled:boolean}

@Component({selector:'app-dropdown',standalone:true,templateUrl:'./dropdown.component.html',
  styleUrl:'./dropdown.component.css',providers:[{provide:NG_VALUE_ACCESSOR,useExisting:DropdownComponent,multi:true}]})
export class DropdownComponent implements ControlValueAccessor,AfterViewInit,DoCheck,OnDestroy{
  private static nextId=0;
  @ViewChild('trigger') trigger?:ElementRef<HTMLButtonElement>;
  @ViewChild('optionList') optionList?:ElementRef<HTMLElement>;
  @HostBinding('class.bad') @Input() bad=false;
  @Input() disabled=false;
  @Input() ariaLabel='';
  options:DropdownOption[]=[];
  value='';
  open=false;
  opensUp=false;
  activeIndex=-1;
  listTop=0;
  listLeft=0;
  listWidth=0;
  maxHeight=240;
  readonly id=`dropdown-${++DropdownComponent.nextId}`;
  private optionSignature='';
  private labelId='';
  private readonly scrollHandler=()=>{if(this.open)this.positionList()};
  private onChange:(value:string)=>void=()=>{};
  private onTouched:()=>void=()=>{};
  private typeahead='';
  private typeaheadTimer?:ReturnType<typeof setTimeout>;

  constructor(private element:ElementRef<HTMLElement>,private renderer:Renderer2){}

  get selectedLabel():string{
    return this.options.find(option=>option.value===this.value)?.label??'';
  }

  ngAfterViewInit():void{
    const label=this.element.nativeElement.closest('app-field')?.querySelector<HTMLElement>('.field-label');
    if(label){
      if(!label.id||label.id==='-label')label.id=`${this.id}-label`;
      this.labelId=label.id;
    }
    window.addEventListener('scroll',this.scrollHandler,true);
    window.addEventListener('resize',this.scrollHandler);
  }

  ngDoCheck():void{
    const projected=this.element.nativeElement.querySelectorAll<HTMLOptionElement>('.dropdown-source option');
    const options=Array.from(projected).filter(option=>!option.hidden).map(option=>({
      value:option.value,
      label:(option.label||option.textContent||'').trim(),
      disabled:option.disabled,
    }));
    const signature=JSON.stringify(options);
    if(signature===this.optionSignature)return;
    this.optionSignature=signature;
    this.options=options;
    const selected=this.options.findIndex(option=>option.value===this.value&&!option.disabled);
    this.activeIndex=selected>=0?selected:this.options.findIndex(option=>!option.disabled);
    if(this.open)requestAnimationFrame(()=>this.positionList());
  }

  ngOnDestroy():void{
    window.removeEventListener('scroll',this.scrollHandler,true);
    window.removeEventListener('resize',this.scrollHandler);
    if(this.typeaheadTimer)clearTimeout(this.typeaheadTimer);
    const list=this.optionList?.nativeElement;
    if(list?.parentElement===document.body)this.renderer.appendChild(this.element.nativeElement,list);
  }

  writeValue(value:string|null):void{
    this.value=value??'';
    const selected=this.options.findIndex(option=>option.value===this.value&&!option.disabled);
    if(selected>=0)this.activeIndex=selected;
  }

  registerOnChange(fn:(value:string)=>void):void{this.onChange=fn}
  registerOnTouched(fn:()=>void):void{this.onTouched=fn}
  setDisabledState(disabled:boolean):void{this.disabled=disabled}

  toggle():void{
    if(this.disabled)return;
    if(this.open)this.close();
    else this.openList();
  }

  onKeydown(event:KeyboardEvent):void{
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){
      event.preventDefault();
      if(!this.open)this.openList(event.key==='ArrowUp');
      else this.moveActive(event.key==='ArrowDown'?1:-1);
      return;
    }
    if(event.key==='Home'||event.key==='End'){
      if(!this.open)return;
      event.preventDefault();
      this.setActiveIndex(this.findEnabled(event.key==='Home'?0:this.options.length-1,event.key==='Home'?1:-1));
      return;
    }
    if(event.key==='Enter'||event.key===' '){
      event.preventDefault();
      if(!this.open)this.openList();
      else this.selectActive();
      return;
    }
    if(event.key==='Escape'&&this.open){
      event.preventDefault();
      this.close();
      return;
    }
    if(event.key==='Tab'){this.close();return}
    if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey)this.search(event.key);
  }

  select(option:DropdownOption):void{
    if(option.disabled)return;
    this.value=option.value;
    this.onChange(this.value);
    this.close();
    this.trigger?.nativeElement.focus();
  }

  @HostListener('document:click',['$event'])
  closeOnOutsideClick(event:MouseEvent):void{
    const target=event.target as Node;
    if(!this.element.nativeElement.contains(target)&&!this.optionList?.nativeElement.contains(target))this.close();
  }

  private openList(fromEnd=false):void{
    if(!this.options.some(option=>!option.disabled))return;
    this.open=true;
    const list=this.optionList?.nativeElement;
    if(list&&list.parentElement!==document.body)this.renderer.appendChild(document.body,list);
    const selected=this.options.findIndex(option=>option.value===this.value&&!option.disabled);
    this.activeIndex=selected>=0?selected:this.findEnabled(fromEnd?this.options.length-1:0,fromEnd?-1:1);
    requestAnimationFrame(()=>this.positionList());
  }

  private close():void{
    if(!this.open)return;
    this.open=false;
    this.onTouched();
    const list=this.optionList?.nativeElement;
    if(list?.parentElement===document.body)this.renderer.appendChild(this.element.nativeElement,list);
  }

  private positionList():void{
    const trigger=this.trigger?.nativeElement;
    if(!trigger)return;
    const rect=trigger.getBoundingClientRect();
    const below=Math.max(0,window.innerHeight-rect.bottom-8);
    const above=Math.max(0,rect.top-8);
    const desiredHeight=Math.min(240,this.options.filter(option=>!option.disabled).length*40);
    this.opensUp=below<Math.min(desiredHeight,160)&&above>below;
    const available=this.opensUp?above:below;
    this.maxHeight=Math.max(0,Math.min(240,available-8));
    this.listWidth=rect.width;
    this.listLeft=Math.max(8,Math.min(rect.left,window.innerWidth-rect.width-8));
    const listHeight=Math.min(this.maxHeight,desiredHeight);
    this.listTop=this.opensUp?Math.max(8,rect.top-listHeight-4):rect.bottom+4;
    const list=this.optionList?.nativeElement;
    if(list){
      this.renderer.setStyle(list,'top',`${this.listTop}px`);
      this.renderer.setStyle(list,'left',`${this.listLeft}px`);
      this.renderer.setStyle(list,'width',`${this.listWidth}px`);
      this.renderer.setStyle(list,'max-height',`${this.maxHeight}px`);
    }
    const computed=getComputedStyle(trigger);
    for(const variable of ['--card','--bd','--tx','--mu','--lb','--lb2','--navy2','--blue']){
      const value=computed.getPropertyValue(variable).trim();
      if(value)this.optionList?.nativeElement.style.setProperty(variable,value);
    }
  }

  private moveActive(direction:1|-1):void{
    this.setActiveIndex(this.findEnabled(this.activeIndex+direction,direction));
  }

  private findEnabled(start:number,direction:1|-1):number{
    for(let index=start;index>=0&&index<this.options.length;index+=direction){
      if(!this.options[index].disabled)return index;
    }
    return this.activeIndex;
  }

  private setActiveIndex(index:number):void{
    if(index>=0&&index<this.options.length&&!this.options[index].disabled)this.activeIndex=index;
    requestAnimationFrame(()=>this.scrollActiveOptionIntoView());
  }

  private selectActive():void{
    const option=this.options[this.activeIndex];
    if(option)this.select(option);
  }

  private scrollActiveOptionIntoView():void{
    const option=this.optionList?.nativeElement.querySelector<HTMLElement>(`[data-option-index="${this.activeIndex}"]`);
    option?.scrollIntoView?.({block:'nearest'});
  }

  private search(character:string):void{
    this.typeahead+=character.toLocaleLowerCase();
    if(this.typeaheadTimer)clearTimeout(this.typeaheadTimer);
    this.typeaheadTimer=setTimeout(()=>this.typeahead='',700);
    const start=this.activeIndex+1;
    const ordered=[...this.options.slice(start),...this.options.slice(0,start)];
    const match=ordered.find(option=>!option.disabled&&option.label.toLocaleLowerCase().startsWith(this.typeahead));
    if(match){
      if(!this.open)this.openList();
      this.activeIndex=this.options.indexOf(match);
      requestAnimationFrame(()=>this.scrollActiveOptionIntoView());
    }
  }
}
