import { fullName } from './full-name';

describe('fullName',()=>{
  it('joins the first, middle, and last names in order',()=>{
    expect(fullName('Asthon','Lloyd','Quisquisol'))
      .toBe('Asthon Lloyd Quisquisol');
  });

  it('trims names, skips a missing middle name, and uses the fallback when needed',()=>{
    expect(fullName('  Juan  ',' ','Dela Cruz')).toBe('Juan Dela Cruz');
    expect(fullName('Juan','Carlos','Dela Cruz')).toBe('Juan Carlos Dela Cruz');
    expect(fullName('',null,'','Legacy Full Name')).toBe('Legacy Full Name');
    expect(fullName('', 'Marie', '', 'Legacy Full Name')).toBe('Legacy Full Name');
    expect(fullName('',null,'')).toBe('');
  });
});
