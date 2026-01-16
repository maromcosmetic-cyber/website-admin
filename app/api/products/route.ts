import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getSupabase() {
    if (!supabaseUrl || !supabaseKey) return null;
    return createClient(supabaseUrl, supabaseKey);
}

export async function GET() {
    try {
        const supabase = getSupabase();
        if (!supabase) {
            return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
        }
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('name');

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
        }

        return NextResponse.json(products || []);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const supabase = getSupabase();
        if (!supabase) {
            return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
        }
        const product = await request.json();

        // Update product in Supabase
        const { data, error } = await supabase
            .from('products')
            .update(product)
            .eq('id', product.id)
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
        }

        return NextResponse.json({ success: true, product: data });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}
