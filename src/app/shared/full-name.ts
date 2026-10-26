export function fullName(
  firstName:string|null|undefined,
  middleName:string|null|undefined,
  lastName:string|null|undefined,
  fallback:string|null|undefined=''
):string{
  const first=firstName?.trim()||'';
  const middle=middleName?.trim()||'';
  const last=lastName?.trim()||'';
  const name=first&&last?[first,middle,last].filter(Boolean).join(' '):'';
  return name||fallback?.trim()||'';
}
