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
        from: () => {
            const notConfiguredError = {
                message: 'Supabase not configured',
                details: null,
                hint: null,
                code: 'SUPABASE_NOT_CONFIGURED'
            };

            const makeThenable = (result: any) => {
                const promise = Promise.resolve(result);
                return {
                    then: promise.then.bind(promise),
                    catch: promise.catch.bind(promise),
                    finally: promise.finally.bind(promise)
                };
            };

            const makeQueryBuilder = (result: any) => {
                const builder: any = {
                    eq: () => builder,
                    order: () => builder,
                    in: () => builder,
                    single: () => makeQueryBuilder({ data: null, error: notConfiguredError }),
                    select: () => builder,
                };

                return Object.assign(builder, makeThenable(result));
            };

            return {
                select: () => makeQueryBuilder({ data: [], error: notConfiguredError }),
                insert: () => makeQueryBuilder({ data: null, error: notConfiguredError }),
                update: () => makeQueryBuilder({ data: null, error: notConfiguredError }),
                upsert: () => makeQueryBuilder({ data: null, error: notConfiguredError }),
                delete: () => makeQueryBuilder({ data: null, error: notConfiguredError }),
            };
        },
        storage: {
            from: () => ({
                list: () => Promise.resolve({ data: [], error: null }),
                upload: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
                getPublicUrl: () => ({ data: { publicUrl: '' } })
            })
        }
    } as any;
