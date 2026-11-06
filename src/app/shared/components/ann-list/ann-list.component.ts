import { ChangeDetectorRef, Component,Input } from '@angular/core';
import { COMMON } from '../../common';
import { Ann,AnnouncementReader,DataService } from '../../../core/data.service';
import { AuthService } from '../../../core/auth.service';

@Component({selector:'app-ann-list',standalone:true,imports:[COMMON],styleUrl:'./ann-list.component.css',templateUrl:'./ann-list.component.html'})
export class AnnListComponent{
  @Input() items:Ann[]=[];@Input() loading=false;
  @Input() showReadReceipts=false;
  @Input() emptyMessage='No records found. No announcements yet.';
  sel:Ann|null=null;
  readers:AnnouncementReader[]=[];readerCount=0;recipientCount=0;readerLoading=false;readerError='';readError='';
  constructor(public d:DataService,public auth:AuthService,private cdr:ChangeDetectorRef){}
  open(announcement:Ann){
    this.sel=announcement;this.readers=[];this.readerCount=0;this.recipientCount=0;this.readerError='';this.readError='';
    if(this.showReadReceipts)void this.loadReaders(announcement.id);
    if(!this.showReadReceipts&&(this.auth.role==='student'||this.auth.role==='faculty'||this.auth.role==='registrar'||this.auth.role==='admin')){
      void this.d.markAnnouncementRead(announcement.id).catch(error=>{
        this.readError=(error as {error?:{message?:string}})?.error?.message
          ||(error instanceof Error?error.message:'Read confirmation could not be saved.');
        this.cdr.markForCheck();
      });
    }
  }
  async loadReaders(id:number){
    this.readerLoading=true;
    try{
      const result=await this.d.announcementReaders(id);
      if(this.sel?.id!==id)return;
      this.readers=result.readers;this.readerCount=result.read_count;this.recipientCount=result.recipients;
    }catch(error){
      this.readerError=(error as {error?:{message?:string}})?.error?.message
        ||(error instanceof Error?error.message:'Read confirmations could not be loaded.');
    }finally{this.readerLoading=false;this.cdr.markForCheck()}
  }
}
