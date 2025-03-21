import { createClient } from '@supabase/supabase-js'; 

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if(!SUPABASE_URL || !SUPABASE_ANON_KEY){
  throw new Error('Missing Supabase Enviroment Variables');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getPhotos(){
  const {data, error } = await supabase
    .storage
    .from('vcinesquecivel')
    .list('', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc'}
    });

  if(error){
    console.error('Error fetching photos', error);
    return [];
  }

  return data
  .filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp|heic|tiff|bmp|svg)$/i))
  .map(file => ({
    id: file.id,
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/vcinesquecivel/${file.name}`,
    caption: file.name.split('.')[0].split('-').slice(1).join(' '),
    date: file.name.split('-')[0],
    fileName: file.name
  }))
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export async function uploadPhoto(file: File, caption: string, date: string) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${date}-${caption}.${fileExt}`

  const { error } = await supabase.storage
    .from('vcinesquecivel')
    .upload(fileName, file)

  if (error) {
    throw error
  }

  return fileName
}
