const MAX_PROFILE_PICTURE_SIZE=5*1024*1024;
const PROFILE_PICTURE_TYPES=new Set(['image/jpeg','image/png','image/webp']);

export async function processProfilePicture(file:File):Promise<string>{
  if(!PROFILE_PICTURE_TYPES.has(file.type))
    throw new Error('Choose a JPG, PNG, or WebP image.');
  if(file.size>MAX_PROFILE_PICTURE_SIZE)
    throw new Error('Choose an image smaller than 5 MB.');

  const bitmap=await createImageBitmap(file);
  try{
    const scale=Math.min(1,512/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(bitmap.width*scale));
    canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    const context=canvas.getContext('2d');
    if(!context)throw new Error('Your browser could not prepare this image.');
    context.drawImage(bitmap,0,0,canvas.width,canvas.height);
    const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(
      value=>value?resolve(value):reject(new Error('Your browser could not compress this image.')),
      'image/webp',0.86));
    return await new Promise<string>((resolve,reject)=>{
      const reader=new FileReader();
      reader.onerror=()=>reject(new Error('Your browser could not read this image.'));
      reader.onload=()=>typeof reader.result==='string'
        ?resolve(reader.result):reject(new Error('Your browser could not read this image.'));
      reader.readAsDataURL(blob);
    });
  }finally{bitmap.close()}
}
