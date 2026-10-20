export function fullName(name:string|null|undefined,middleName:string|null|undefined):string{
  const normalizedName=(name||'').trim().replace(/\s+/g,' ');
  const middle=(middleName||'').trim().replace(/\s+/g,' ');
  if(!middle)return normalizedName;
  if(!normalizedName)return middle;

  const nameParts=normalizedName.toLocaleLowerCase().split(' ');
  const middleParts=middle.toLocaleLowerCase().split(' ');
  const alreadyIncluded=nameParts.some((_,start)=>middleParts.every(
    (part,index)=>nameParts[start+index]===part
  ));
  if(alreadyIncluded)return normalizedName;

  const [firstName,...remainingName]=normalizedName.split(' ');
  return [firstName,middle,...remainingName].filter(Boolean).join(' ');
}
