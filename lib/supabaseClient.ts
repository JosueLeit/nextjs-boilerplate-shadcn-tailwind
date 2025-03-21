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
    console.log('[AUTH] Iniciando login com:', email);
    
    // Limpar qualquer sessão anterior para evitar problemas
    await supabase.auth.signOut();
    
    // Fazer login com persistência da sessão
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (data?.session) {
      console.log('[AUTH] Sessão estabelecida:', {
        userId: data.session.user.id,
        expires: data.session.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : 'indefinido'
      });
      
      // Garantir que a sessão seja persistida no storage local
      if (typeof window !== 'undefined' && data.session.expires_at) {
        // Armazenar token no localStorage para que o cliente Supabase possa encontrá-lo
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          currentSession: data.session,
          expiresAt: data.session.expires_at
        }));
        
        // Armazenar também como cookies explícitos para que o middleware possa detectá-los
        if (data.session.access_token) {
          const maxAge = data.session.expires_in || 3600;
          document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
          
          if (data.session.refresh_token) {
            document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=${maxAge * 2}; SameSite=Lax`;
          }
        }
        
        // Forçar atualização da sessão no cliente
        await forceSessionRefresh();
        
        // Recarregar a página para garantir que o middleware reconheça os novos cookies
        console.log('[AUTH] Login bem-sucedido, recarregando página para atualizar sessão');
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      }
    } else if (error) {
      console.error('[AUTH] Erro no login:', error.message);
    } else {
      console.warn('[AUTH] Login sem erro, mas sem sessão!');
    }
    
    // Limpar imediatamente qualquer referência à senha na memória
    password = '';
    
    return { data, error };
  } catch (error) {
    // Limpar senha mesmo em caso de erro
    password = '';
    console.error('[AUTH] Exceção no login:', error);
    throw error;
  }
}

// Função para forçar atualização da sessão no cliente
export async function forceSessionRefresh() {
  if (typeof window === 'undefined') return; // Executar apenas no cliente
  
  try {
    console.log('[AUTH] Forçando atualização da sessão');
    
    // Primeiro, tenta obter a sessão atual
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Se temos uma sessão, forçar o evento SIGNED_IN manualmente
      console.log('[AUTH] Sessão encontrada, forçando atualização');
      
      // Definir o cookie de sessão explicitamente
      document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${session.expires_in}; SameSite=Lax`;
      document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=${session.expires_in * 2}; SameSite=Lax`;
      
      // Notificar listeners sobre a sessão atualizada
      window.dispatchEvent(new Event('supabase.auth.session-refreshed'));
      
      return true;
    } else {
      console.warn('[AUTH] Sem sessão para atualizar');
      return false;
    }
  } catch (error) {
    console.error('[AUTH] Erro ao forçar atualização da sessão:', error);
    return false;
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
