import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors during Next.js static generation
let _supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (_supabase) return _supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // During build/prerender, return a mock client that will be replaced at runtime
    // This prevents build failures while keeping TypeScript happy
    throw new Error('Supabase client accessed during build without env vars');
  }

  _supabase = createClient(url, key);
  return _supabase;
}

// Export a proxy that lazily initializes the client
// This ensures the client is only created when actually used at runtime
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

// Helper to check if Supabase is properly configured (for runtime checks)
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// Get URL for storage operations (used in getPhotos)
export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

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
  // Note: This function is deprecated. Use AuthContext.login() instead.
  // Keeping for backwards compatibility only.
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('[AUTH] Erro no login:', error.message);
    throw error;
  }

  return { data, error };
}

// Função para forçar atualização da sessão no cliente
export async function forceSessionRefresh() {
  if (typeof window === 'undefined') return false;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('[AUTH] Erro ao verificar sessão:', error);
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
  // Get the current origin for the redirect URL
  const redirectTo = typeof window !== 'undefined'
    ? `${window.location.origin}/update-password`
    : undefined;

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  return { data, error };
}

// Função para obter fotos do usuário atual ou todas as fotos se userId não for fornecido
export async function getPhotos(userId?: string){
  if (!userId) {
    throw new Error('userId é obrigatório para listar fotos');
  }

  console.log('[PHOTOS] Buscando fotos para userId:', userId);

  const { data, error } = await supabase
    .storage
    .from('vcinesquecivel')
    .list(userId, {  // Listar apenas no diretório do usuário
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc'}
    });

  if(error){
    console.error('[PHOTOS] Erro ao buscar fotos:', error);
    throw error;
  }

  if (!data) {
    console.log('[PHOTOS] Nenhuma foto encontrada para o usuário');
    return [];
  }

  console.log('[PHOTOS] Fotos encontradas:', data.length);
  console.log('[PHOTOS] Lista de arquivos:', data.map(f => f.name));

  return data
    // Incluir outros formatos de imagem populares como webp, heic, tiff, bmp
    .filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp|heic|tiff|bmp|svg)$/i))
    .map(file => {
      // O nome do arquivo agora está dentro do diretório do usuário
      const fileNameWithoutExt = file.name.split('.')[0];

      // Extrair data e legenda do nome do arquivo
      // Formato esperado: YYYY-MM-DD-legenda
      const match = fileNameWithoutExt.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);

      if (!match) {
        console.error('[PHOTOS] Formato de nome de arquivo inválido:', file.name);
        return null;
      }

      const [_, year, month, day, rawCaption] = match;
      const dateStr = `${year}-${month}-${day}`;
      const caption = rawCaption.replace(/-/g, ' ');

      const fullPath = `${userId}/${file.name}`;
      console.log('[PHOTOS] Processando arquivo:', {
        fullPath,
        dateStr,
        caption
      });

      return {
        id: file.id,
        imageUrl: `${getSupabaseUrl()}/storage/v1/object/public/vcinesquecivel/${fullPath}`,
        caption: caption,
        date: dateStr,
        fileName: fullPath,
        userId
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Ordem decrescente por data
}

// Função atualizada para incluir o userId no nome do arquivo
export async function uploadPhoto(file: File, caption: string, date: string, userId?: string) {
  if (!userId) {
    throw new Error('userId é obrigatório para upload de fotos');
  }

  console.log('[PHOTOS] Iniciando upload para userId:', userId);

  const fileExt = file.name.split('.').pop();

  // Garantir que a data está no formato YYYY-MM-DD
  let formattedDate = date;
  if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    try {
      const dateObj = new Date(date);
      formattedDate = dateObj.toISOString().split('T')[0];
    } catch (e) {
      console.error('[PHOTOS] Erro ao formatar data:', e);
      throw new Error('Data inválida');
    }
  }

  // Remover caracteres especiais e espaços da legenda para o nome do arquivo
  const safeCaption = caption
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-'); // Substitui espaços por hífens

  // O arquivo será salvo com apenas o nome do arquivo no diretório do usuário
  const fileName = `${formattedDate}-${safeCaption}.${fileExt}`;
  const fullPath = `${userId}/${fileName}`;

  console.log('[PHOTOS] Tentando upload do arquivo:', {
    fileName,
    fullPath,
    date: formattedDate,
    caption: safeCaption,
    bucket: 'vcinesquecivel'
  });

  const { error } = await supabase.storage
    .from('vcinesquecivel')
    .upload(fullPath, file);

  if (error) {
    console.error('[PHOTOS] Erro no upload:', error);
    throw error;
  }

  console.log('[PHOTOS] Upload concluído com sucesso:', fullPath);
  return fullPath;
}

// ============================================
// PROFILE FUNCTIONS
// ============================================

export interface Profile {
  id: string;
  email: string | null;
  relationship_start_date: string | null;
  onboarding_completed: boolean;
  share_token: string | null;
  share_token_created_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  console.log('[PROFILE] Buscando perfil para userId:', userId);

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found - profile doesn't exist yet
      console.log('[PROFILE] Perfil não encontrado para o usuário');
      return null;
    }
    console.error('[PROFILE] Erro ao buscar perfil:', error);
    throw error;
  }

  console.log('[PROFILE] Perfil encontrado:', data);
  return data;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'relationship_start_date' | 'email' | 'onboarding_completed'>>
): Promise<Profile> {
  console.log('[PROFILE] Atualizando perfil:', { userId, updates });

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      ...updates,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('[PROFILE] Erro ao atualizar perfil:', error);
    throw error;
  }

  console.log('[PROFILE] Perfil atualizado:', data);
  return data;
}

export async function completeOnboarding(
  userId: string,
  relationshipStartDate: string
): Promise<Profile> {
  console.log('[PROFILE] Completando onboarding para userId:', userId);

  const { data, error } = await supabase
    .from('profiles')
    .update({
      relationship_start_date: relationshipStartDate,
      onboarding_completed: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('[PROFILE] Erro ao completar onboarding:', error);
    throw error;
  }

  console.log('[PROFILE] Onboarding completado:', data);
  return data;
}

export async function getProfileByShareToken(shareToken: string): Promise<Profile | null> {
  console.log('[PROFILE] Buscando perfil por share_token');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('share_token', shareToken)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      console.log('[PROFILE] Perfil não encontrado para o token');
      return null;
    }
    console.error('[PROFILE] Erro ao buscar perfil por token:', error);
    throw error;
  }

  return data;
}

export async function regenerateShareToken(userId: string): Promise<Profile> {
  console.log('[PROFILE] Regenerando share token para userId:', userId);

  // Generate new UUID for share token
  const { data, error } = await supabase
    .from('profiles')
    .update({
      share_token: crypto.randomUUID(),
      share_token_created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('[PROFILE] Erro ao regenerar share token:', error);
    throw error;
  }

  console.log('[PROFILE] Share token regenerado');
  return data;
}

export async function ensureShareToken(userId: string): Promise<string> {
  console.log('[PROFILE] Verificando share token para userId:', userId);

  // First, try to get the existing profile
  const profile = await getProfile(userId);

  // If profile exists and has a share_token, return it
  if (profile?.share_token) {
    console.log('[PROFILE] Share token já existe');
    return profile.share_token;
  }

  // If no share_token, generate one
  console.log('[PROFILE] Gerando novo share token');
  const newToken = crypto.randomUUID();

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      share_token: newToken,
      share_token_created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('[PROFILE] Erro ao criar share token:', error);
    throw error;
  }

  console.log('[PROFILE] Share token criado:', data.share_token);
  return data.share_token;
}
