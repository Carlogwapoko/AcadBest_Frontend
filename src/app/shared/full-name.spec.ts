import { fullName } from './full-name';

describe('fullName',()=>{
  it('preserves a stored multi-part given name without inserting a middle name',()=>{
    expect(fullName('Asthon Lloyd Quisquisol','Barbante'))
      .toBe('Asthon Lloyd Quisquisol');
  });

  it('preserves whitespace and gracefully handles missing names',()=>{
    expect(fullName('  Juan   Dela Cruz  ','Carlos')).toBe('  Juan   Dela Cruz  ');
    expect(fullName('Juan Dela Cruz',' ')).toBe('Juan Dela Cruz');
    expect(fullName('',null)).toBe('');
  });
});
