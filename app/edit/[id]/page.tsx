"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '../../types';
import Link from 'next/link';
import ImagePicker from '../../components/ImagePicker';
import { supabase } from '../../../lib/supabase';

interface Ingredient {
    id: string;
    name: string;
    image: string;
    description: string;
}

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [product, setProduct] = useState<Product | null>(null);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showImagePicker, setShowImagePicker] = useState(false);

    // Load products and ingredients
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Fetch Ingredients directly from Supabase
                const { data: ingData, error: ingError } = await supabase
                    .from('ingredients')
                    .select('*')
                    .order('name');

                if (ingError) throw ingError;
                setIngredients(ingData || []);

                // Fetch Single Product
                const { data: prodData, error: prodError } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (prodError) throw prodError;
                setProduct(prodData);

            } catch (err) {
                console.error("Error loading data:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;
        setSaving(true);

        try {
            // Update Supabase
            const { error } = await supabase
                .from('products')
                .update({
                    name: product.name,
                    price: product.price,
                    description: product.description,
                    image: product.image,
                    ingredient_ids: product.ingredient_ids, // Updated array column
                    ingredients: product.ingredients, // Array to JSONB
                    benefits: product.benefits,       // Array to JSONB
                    updated_at: new Date().toISOString()
                })
                .eq('id', product.id);

            if (error) {
                console.error('Supabase error:', error);
                alert('Error saving to database: ' + error.message);
            } else {
                // Also update local state/redirect
                alert('Product saved successfully!');
                router.push('/products');
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            alert('Unexpected error saving');
        } finally {
            setSaving(false);
        }
    };

    const toggleIngredient = (ingredientId: string) => {
        if (!product) return;
        const current = product.ingredient_ids || [];
        const updated = current.includes(ingredientId)
            ? current.filter((id: string) => id !== ingredientId)
            : [...current, ingredientId];
        setProduct({ ...product, ingredient_ids: updated });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-[#015030]">Loading...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center text-[#015030]">Product not found</div>;

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-[#015030] p-8 pb-32 font-sans">
            <header className="max-w-4xl mx-auto mb-12 pt-8">
                <Link href="/" className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] font-bold text-[#015030]/60 hover:text-[#015030] transition-colors mb-6">
                    ← Back to Dashboard
                </Link>
                <h1 className="text-4xl font-serif font-semibold">Edit Product</h1>
            </header>

            <main className="max-w-4xl mx-auto">
                <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-xl border border-[#015030]/10 p-12 space-y-10">

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-[0.2em] font-bold text-[#015030]/60">Product Name</label>
                            <input
                                type="text"
                                value={product.name}
                                onChange={e => setProduct({ ...product, name: e.target.value })}
                                className="w-full text-xl font-serif text-[#015030] border-b-2 border-[#015030]/10 focus:border-[#FDB723] outline-none py-2 bg-transparent transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-[0.2em] font-bold text-[#015030]/60">Price (THB)</label>
                            <input
                                type="number"
                                value={product.price}
                                onChange={e => setProduct({ ...product, price: Number(e.target.value) })}
                                className="w-full text-xl font-serif text-[#015030] border-b-2 border-[#015030]/10 focus:border-[#FDB723] outline-none py-2 bg-transparent transition-colors"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.2em] font-bold text-[#015030]/60">Description</label>
                        <textarea
                            value={product.description}
                            onChange={e => setProduct({ ...product, description: e.target.value })}
                            className="w-full text-lg leading-relaxed text-[#015030]/80 border-b-2 border-[#015030]/10 focus:border-[#FDB723] outline-none py-2 bg-transparent min-h-[100px] resize-none transition-colors"
                        />
                    </div>

                    {/* Product Image */}
                    <div className="space-y-4">
                        <label className="text-xs uppercase tracking-[0.2em] font-bold text-[#015030]/60">Product Image</label>
                        <div className="flex gap-6 items-start">
                            {/* Image Preview */}
                            <div className="w-40 h-40 bg-[#E8E4D9] rounded-2xl overflow-hidden border-2 border-[#015030]/10 flex items-center justify-center flex-shrink-0">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center text-[#015030]/30">
                                        <div className="text-4xl mb-2">📷</div>
                                        <div className="text-xs">No Image</div>
                                    </div>
                                )}
                            </div>
                            {/* Image URL Input */}
                            <div className="flex-1 space-y-3">
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={product.image || ''}
                                        onChange={e => setProduct({ ...product, image: e.target.value })}
                                        className="flex-1 text-base text-[#015030] border-b-2 border-[#015030]/10 focus:border-[#FDB723] outline-none py-2 bg-transparent transition-colors"
                                        placeholder="/images/products/product-name.jpg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowImagePicker(true)}
                                        className="px-6 py-2 bg-[#015030] text-white rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform whitespace-nowrap"
                                    >
                                        Browse Library
                                    </button>
                                </div>
                                <p className="text-xs text-[#015030]/40 italic">
                                    Enter the image URL or browse from library. Upload images to <code className="bg-[#015030]/5 px-2 py-1 rounded">/public/images/products/</code>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Ingredients Selector */}
                    <div className="space-y-4">
                        <label className="text-xs uppercase tracking-[0.2em] font-bold text-[#015030]/60">Select Ingredients</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {ingredients.map(ing => (
                                <button
                                    key={ing.id}
                                    type="button"
                                    onClick={() => toggleIngredient(ing.id)}
                                    className={`p-4 border-2 rounded-xl text-left transition-all flex items-center gap-3 ${(product.ingredient_ids || []).includes(ing.id)
                                        ? 'border-[#FDB723] bg-[#FDB723]/10'
                                        : 'border-[#015030]/10 hover:border-[#015030]/30'
                                        }`}
                                >
                                    <div className="w-12 h-12 bg-[#FDFBF7] rounded-lg overflow-hidden flex-shrink-0">
                                        {ing.image && <img src={ing.image.startsWith('http') ? ing.image : `http://localhost:3000${ing.image}`} alt={ing.name} className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="font-bold text-sm">{ing.name}</div>
                                        <div className="text-xs text-[#015030]/50 line-clamp-1">{ing.description}</div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${(product.ingredient_ids || []).includes(ing.id)
                                        ? 'border-[#FDB723] bg-[#FDB723]'
                                        : 'border-[#015030]/20'
                                        }`}>
                                        {(product.ingredient_ids || []).includes(ing.id) && (
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-[#015030]/40 italic">Select ingredients to display in the product slider</p>
                    </div>

                    {/* Ingredients (Comma Separated) */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.2em] font-bold text-[#015030]/60">Other Ingredients (comma separated)</label>
                        <textarea
                            value={(product.ingredients || []).join(', ')}
                            onChange={e => setProduct({ ...product, ingredients: e.target.value.split(',').map(s => s.trim()) })}
                            className="w-full text-base text-[#015030]/80 border-b-2 border-[#015030]/10 focus:border-[#FDB723] outline-none py-2 bg-transparent transition-colors"
                        />
                        <p className="text-xs text-[#015030]/40 italic">Additional ingredients not in the master list</p>
                    </div>

                    {/* Benefits (Comma Separated) */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.2em] font-bold text-[#015030]/60">Benefits (comma separated)</label>
                        <textarea
                            value={(product.benefits || []).join(', ')}
                            onChange={e => setProduct({ ...product, benefits: e.target.value.split(',').map(s => s.trim()) })}
                            className="w-full text-base text-[#015030]/80 border-b-2 border-[#015030]/10 focus:border-[#FDB723] outline-none py-2 bg-transparent transition-colors"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-8 flex justify-end gap-4">
                        <Link href="/" className="px-12 py-5 border-2 border-[#015030]/20 rounded-full text-lg font-bold uppercase tracking-widest hover:bg-[#015030]/5 transition-colors">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-12 py-5 bg-[#FDB723] text-[#015030] rounded-full text-lg font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-lg disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                </form>
            </main>

            {/* Image Picker Modal */}
            {showImagePicker && (
                <ImagePicker
                    currentImage={product.image || ''}
                    onSelect={(imagePath) => setProduct({ ...product, image: imagePath })}
                    onClose={() => setShowImagePicker(false)}
                />
            )}
        </div>
    );
}
