import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isValidUrl = (url: string) => {
    try {
        return new URL(url).protocol.startsWith('http');
    } catch (e) {
        return false;
    }
};

// Fallback for development to prevent crash if keys are missing
export const supabase = isValidUrl(supabaseUrl) && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        from: () => ({
            select: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } }),
            upload: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
            list: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } }),
            update: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
            upsert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
            eq: () => ({ single: () => Promise.resolve({ data: null, error: null }), update: () => Promise.resolve({ error: { message: 'Supabase not configured' } }) }),
        }),
        storage: {
            from: () => ({
                list: () => Promise.resolve({ data: [], error: null }),
                upload: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
                getPublicUrl: () => ({ data: { publicUrl: '' } })
            })
        }
    } as any;
