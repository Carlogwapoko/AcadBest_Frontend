import { fullName } from './full-name';

describe('fullName',()=>{
  it('places a separate middle name between given name and surname',()=>{
    expect(fullName('Juan Dela Cruz','Carlos')).toBe('Juan Carlos Dela Cruz');
  });

  it('does not duplicate a middle name already included in the stored full name',()=>{
    expect(fullName('Juan Carlos Dela Cruz','Carlos')).toBe('Juan Carlos Dela Cruz');
  });

  it('normalizes whitespace and gracefully handles missing names',()=>{
    expect(fullName('  Juan   Dela Cruz  ','  Carlos  ')).toBe('Juan Carlos Dela Cruz');
    expect(fullName('Juan Dela Cruz',' ')).toBe('Juan Dela Cruz');
    expect(fullName('',null)).toBe('');
  });
});
