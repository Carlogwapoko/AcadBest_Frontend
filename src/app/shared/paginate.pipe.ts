import { Pipe, PipeTransform } from '@angular/core';

export const TABLE_PAGE_SIZE = 10;

@Pipe({
  name: 'paginate',
  standalone: true,
})
export class PaginatePipe implements PipeTransform {
  transform<T>(items: readonly T[] | null | undefined, page: number): T[] {
    if (!items?.length) return [];
    const lastPage = Math.max(1, Math.ceil(items.length / TABLE_PAGE_SIZE));
    const currentPage = Math.min(Math.max(1, Math.floor(page) || 1), lastPage);
    const start = (currentPage - 1) * TABLE_PAGE_SIZE;
    return items.slice(start, start + TABLE_PAGE_SIZE);
  }
}
