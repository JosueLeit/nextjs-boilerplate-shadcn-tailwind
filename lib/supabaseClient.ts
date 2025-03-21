import { createClient, SupabaseClient, User } from '@supabase/supabase-js'; 

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if(!SUPABASE_URL || !SUPABASE_ANON_KEY){
  throw new Error('Missing Supabase Enviroment Variables');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Tipos de autenticação
export type AuthSession = {
  user: User | null;
  error: Error | null;
}

// Funções de autenticação
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  return { data, error };
}

export async function signIn(email: string, password: string) {
  try {
    // Limitar o que é enviado na requisição removendo informações extras que podem expor dados sensíveis
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // Limpar imediatamente qualquer referência à senha na memória
    password = '';
    
    return { data, error };
  } catch (error) {
    // Limpar senha mesmo em caso de erro
    password = '';
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  return { data, error };
}

// Função para obter fotos do usuário atual ou todas as fotos se userId não for fornecido
export async function getPhotos(userId?: string){
  const { data, error } = await supabase
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

  // Filtrar por userId se fornecido
  let filteredData = data;
  if (userId) {
    filteredData = data.filter(file => file.name.startsWith(`${userId}/`));
  }

  return filteredData
  // Incluir outros formatos de imagem populares como webp, heic, tiff, bmp
  .filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp|heic|tiff|bmp|svg)$/i))
  .map(file => {
    // Extrair informações do nome do arquivo
    const fileNameWithoutExt = file.name.split('.')[0];
    const parts = fileNameWithoutExt.split('-');
    
    // A data é a primeira parte ou após a parte do userId/
    let dateStr = parts[0];
    let captionParts = parts.slice(1);
    
    // Se tem userId, ajustar
    if (userId && file.name.includes('/')) {
      // O nome do arquivo seria userId/data-caption
      const nameParts = fileNameWithoutExt.split('/');
      if (nameParts.length > 1) {
        const fileNameAfterUserId = nameParts[1];
        const fileParts = fileNameAfterUserId.split('-');
        dateStr = fileParts[0];
        captionParts = fileParts.slice(1);
      }
    }
    
    return {
      id: file.id,
      imageUrl: `${SUPABASE_URL}/storage/v1/object/public/vcinesquecivel/${file.name}`,
      caption: captionParts.join(' '),
      date: dateStr,
      fileName: file.name,
      userId: userId || null
    };
  })
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// Função atualizada para incluir o userId no nome do arquivo
export async function uploadPhoto(file: File, caption: string, date: string, userId?: string) {
  const fileExt = file.name.split('.').pop();
  
  // Garantir que a data está no formato YYYY-MM-DD
  let formattedDate = date;
  if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    try {
      const dateObj = new Date(date);
      formattedDate = dateObj.toISOString().split('T')[0];
    } catch (e) {
      console.error('Erro ao formatar data:', e);
    }
  }
  
  // Remover caracteres especiais e espaços da legenda para o nome do arquivo
  const safeCaption = caption.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
  
  // Se o userId for fornecido, incluir no path
  const fileName = userId 
    ? `${userId}/${formattedDate}-${safeCaption}.${fileExt}` 
    : `${formattedDate}-${safeCaption}.${fileExt}`;

  const { error } = await supabase.storage
    .from('vcinesquecivel')
    .upload(fileName, file);

  if (error) {
    throw error;
  }

  return fileName;
}
