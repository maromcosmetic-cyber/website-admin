"use client";

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Leaf, Search, Plus, Loader2, AlertCircle, X, Upload, Save, Trash2 } from 'lucide-react';

// Types
interface Ingredient {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    benefits: string[]; // Stored as JSON array in DB
}

export default function IngredientsPage() {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Editing State
    const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState<{
        name: string;
        description: string;
        benefits: string; // Comma separated for input
        imageFile: File | null;
        imagePreview: string | null;
    }>({
        name: '',
        description: '',
        benefits: '',
        imageFile: null,
        imagePreview: null
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchIngredients = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('ingredients')
                .select('*')
                .order('name');

            if (error) throw error;
            setIngredients(data || []);
        } catch (err: any) {
            console.error('Error fetching ingredients:', err);
            if (err.message?.includes('relation "ingredients" does not exist')) {
                setError("The 'ingredients' table does not exist yet. Please run the setup SQL script.");
            } else {
                setError(err.message || 'Failed to fetch ingredients');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchIngredients();
    }, []);

    const handleEditClick = (ing: Ingredient) => {
        setEditingIngredient(ing);
        setEditForm({
            name: ing.name,
            description: ing.description || '',
            benefits: Array.isArray(ing.benefits) ? ing.benefits.join(', ') : '',
            imageFile: null,
            imagePreview: ing.image // Start with existing image
        });
    };

    const closeEditModal = () => {
        setEditingIngredient(null);
        setEditForm({ name: '', description: '', benefits: '', imageFile: null, imagePreview: null });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setEditForm(prev => ({
                ...prev,
                imageFile: file,
                imagePreview: URL.createObjectURL(file)
            }));
        }
    };

    const handleSave = async () => {
        if (!editingIngredient) return;
        setIsSaving(true);

        try {
            let finalImagePath = editingIngredient.image;

            // 1. Upload new image if selected
            if (editForm.imageFile) {
                const file = editForm.imageFile;
                const fileExt = file.name.split('.').pop();
                const fileName = `${editingIngredient.slug}-${Date.now()}.${fileExt}`;
                const filePath = `ingredients/${fileName}`;

                // Attempt upload to 'uploads' bucket (assuming it exists based on plan)
                const { error: uploadError } = await supabase.storage
                    .from('uploads')
                    .upload(filePath, file);

                if (uploadError) {
                    // Fallback: try 'images' bucket if 'uploads' fails, or alert user
                    const { error: retryError } = await supabase.storage
                        .from('images')
                        .upload(filePath, file);

                    if (retryError) throw new Error(`Upload failed: ${uploadError.message}`);

                    // If retry worked, update path
                    const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(filePath);
                    finalImagePath = publicUrlData.publicUrl;
                } else {
                    const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(filePath);
                    finalImagePath = publicUrlData.publicUrl;
                }
            }

            // 2. Prepare benefits array
            const benefitsArray = editForm.benefits
                .split(',')
                .map(b => b.trim())
                .filter(b => b.length > 0);

            // 3. Update Database
            const { error: updateError } = await supabase
                .from('ingredients')
                .update({
                    name: editForm.name,
                    description: editForm.description,
                    benefits: benefitsArray, // Supabase handles array -> jsonb auto-casting usually, or array
                    image: finalImagePath,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editingIngredient.id);

            if (updateError) throw updateError;

            // 4. Refresh & Close
            await fetchIngredients();
            closeEditModal();

        } catch (err: any) {
            console.error('Error updating ingredient:', err);
            alert(`Failed to save: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredIngredients = ingredients.filter(ing =>
        ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ing.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-10 w-full max-w-[1600px] mx-auto text-marom-dark relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-serif text-[#015030] mb-2 flex items-center gap-3">
                        <Leaf className="w-8 h-8 text-[#FDB723]" />
                        Ingredients Library
                    </h1>
                    <p className="text-gray-500">Manage botanical ingredients and their benefits.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search ingredients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#015030]/20 w-64 shadow-sm"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#015030] text-white rounded-full text-sm font-bold uppercase tracking-wider hover:bg-[#015030]/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5" disabled>
                        <Plus className="w-4 h-4" />
                        Add New (Coming Soon)
                    </button>
                </div>
            </div>

            {/* Grid Content */}
            <div className="min-h-[400px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#FDB723]" />
                        <p>Loading ingredients...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center max-w-2xl mx-auto">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-red-800 mb-2">Unable to Load Data</h3>
                        <p className="text-red-600 mb-6">{error}</p>
                        <button
                            onClick={fetchIngredients}
                            className="px-6 py-2 bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredIngredients.length === 0 ? (
                    <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No ingredients found</h3>
                        <p className="text-gray-500">
                            {searchQuery ? `No matches for "${searchQuery}"` : "Get started by adding your first ingredient."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredIngredients.map((ing) => (
                            <div key={ing.id} className="group bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#FDB723]/30 transition-all duration-300 flex flex-col">
                                <div className="relative aspect-square mb-6 rounded-xl overflow-hidden bg-[#F9F9F9] p-8 group-hover:bg-[#FDFBF7] transition-colors">
                                    {/* Handle both local path (seed data) and full URLs (uploaded) */}
                                    <img
                                        src={ing.image}
                                        alt={ing.name}
                                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>

                                <div className="px-2 pb-2 flex-1 flex flex-col">
                                    <h3 className="text-lg font-serif font-bold text-[#015030] mb-2 group-hover:text-[#FDB723] transition-colors">
                                        {ing.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                                        {ing.description || 'No description available.'}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {ing.benefits && Array.isArray(ing.benefits) && ing.benefits.slice(0, 2).map((benefit, i) => (
                                            <span key={i} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-[#015030]/5 text-[#015030] rounded-full font-medium">
                                                {benefit}
                                            </span>
                                        ))}
                                        {ing.benefits && Array.isArray(ing.benefits) && ing.benefits.length > 2 && (
                                            <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-gray-100 text-gray-500 rounded-full font-medium">
                                                +{ing.benefits.length - 2}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-auto">
                                        <button
                                            onClick={() => handleEditClick(ing)}
                                            className="w-full py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-[#015030] hover:text-white hover:border-[#015030] transition-colors"
                                        >
                                            Edit Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingIngredient && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">

                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-2xl font-serif text-[#015030] flex items-center gap-3">
                                Edit Ingredient
                                <span className="text-sm font-sans font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                                    {editingIngredient.name}
                                </span>
                            </h2>
                            <button onClick={closeEditModal} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Image Upload Section */}
                            <div className="flex gap-8 items-start">
                                <div
                                    className="w-40 h-40 bg-gray-50 rounded-2xl flex-shrink-0 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#FDB723] hover:bg-[#FDB723]/5 transition-all relative overflow-hidden group"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {editForm.imagePreview ? (
                                        <img
                                            src={editForm.imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-contain p-4 mix-blend-multiply"
                                        />
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:text-[#FDB723]" />
                                            <span className="text-xs text-gray-400 group-hover:text-[#FDB723] font-medium">Change Image</span>
                                        </>
                                    )}
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-xs font-bold uppercase tracking-wider">Change</span>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />

                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#015030]/20 font-serif text-lg text-[#015030]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Benefits (comma separated)</label>
                                        <input
                                            type="text"
                                            value={editForm.benefits}
                                            onChange={e => setEditForm({ ...editForm, benefits: e.target.value })}
                                            placeholder="e.g. Hydrating, Soothing, Anti-aging"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#015030]/20 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Description</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#015030]/20 text-sm leading-relaxed"
                                />
                            </div>

                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-3xl">
                            <button
                                onClick={closeEditModal}
                                disabled={isSaving}
                                className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-8 py-3 bg-[#015030] text-white rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-[#015030]/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
