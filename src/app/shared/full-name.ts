export function fullName(name:string|null|undefined,middleName:string|null|undefined):string{
  if(name?.trim())return name;
  return middleName||'';
}
