import { PaginatePipe } from './paginate.pipe';

describe('PaginatePipe', () => {
  const pipe = new PaginatePipe();
  const items = Array.from({ length: 23 }, (_, index) => index + 1);

  it('limits each page to ten items', () => {
    expect(pipe.transform(items, 1)).toEqual(items.slice(0, 10));
    expect(pipe.transform(items, 2)).toEqual(items.slice(10, 20));
    expect(pipe.transform(items, 3)).toEqual(items.slice(20));
  });

  it('keeps pages within the available range', () => {
    expect(pipe.transform(items, 4)).toEqual(items.slice(20));
    expect(pipe.transform(items, 0)).toEqual(items.slice(0, 10));
  });
});
