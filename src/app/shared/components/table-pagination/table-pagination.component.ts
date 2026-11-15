import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TABLE_PAGE_SIZE } from '../../paginate.pipe';

@Component({
  selector: 'app-table-pagination',
  standalone: true,
  templateUrl: './table-pagination.component.html',
  styleUrl: './table-pagination.component.css',
})
export class TablePaginationComponent implements OnChanges {
  @Input() page = 1;
  @Input() totalItems = 0;
  @Input() label = 'items';
  @Input() loading = false;
  @Output() pageChange = new EventEmitter<number>();

  readonly pageSize = TABLE_PAGE_SIZE;

  get lastPage(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['page'] || changes['totalItems']) {
      const boundedPage = Math.min(Math.max(1, this.page), this.lastPage);
      if (boundedPage !== this.page) this.pageChange.emit(boundedPage);
    }
  }

  goTo(page: number): void {
    if (this.loading) return;
    const boundedPage = Math.min(Math.max(1, page), this.lastPage);
    if (boundedPage !== this.page) this.pageChange.emit(boundedPage);
  }
}
