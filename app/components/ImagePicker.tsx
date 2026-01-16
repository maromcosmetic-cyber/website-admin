"use client";

import { useEffect, useState, useRef } from 'react';
import { X, Check, Upload, Cloud } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ImagePickerProps {
    currentImage: string;
    onSelect: (imagePath: string) => void;
    onClose: () => void;
}

interface StorageFile {
    name: string;
    url: string;
}

export default function ImagePicker({ currentImage, onSelect, onClose }: ImagePickerProps) {
    const [images, setImages] = useState<StorageFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(currentImage);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        setLoading(true);
        const { data, error } = await supabase.storage.from('products').list('', {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' },
        });

        if (error) {
            console.error('Error fetching images:', error);
        } else if (data) {
            const fileList = data
                .filter(file => file.name !== '.emptyFolderPlaceholder')
                .map(file => {
                    const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(file.name);
                    return {
                        name: file.name,
                        url: publicUrlData.publicUrl
                    };
                });
            setImages(fileList);
        }
        setLoading(false);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-').toLowerCase()}`;

        setUploading(true);
        const { error } = await supabase.storage.from('products').upload(fileName, file);

        if (error) {
            console.error('Upload error:', error);
            alert('Error uploading image');
        } else {
            await fetchImages(); // Refresh list
        }
        setUploading(false);
    };

    const handleSelect = () => {
        onSelect(selectedImage);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-8 border-b border-[#015030]/10 flex justify-between items-center bg-[#FDFBF7]">
                    <div>
                        <h2 className="text-2xl font-serif font-semibold text-[#015030]">Media Library</h2>
                        <p className="text-sm text-[#015030]/60 mt-1">Manage product images via Supabase Storage</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#015030]/5 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-[#015030]" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="px-8 py-4 border-b border-[#015030]/5 flex justify-between items-center bg-white">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#015030]/40">
                        {images.length} Assets Found
                    </p>
                    <div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleUpload}
                            className="hidden"
                            accept="image/*"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="flex items-center gap-2 px-6 py-3 bg-[#015030] text-[#FDB723] rounded-full text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {uploading ? (
                                <span>Uploading...</span>
                            ) : (
                                <>
                                    <Cloud className="w-4 h-4" />
                                    Upload New
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Image Grid */}
                <div className="flex-1 overflow-y-auto p-8 bg-[#F8F5F2]">
                    {loading ? (
                        <div className="text-center py-20 text-[#015030]/60">Loading cloud assets...</div>
                    ) : images.length === 0 ? (
                        <div className="text-center py-20 text-[#015030]/60 border-2 border-dashed border-[#015030]/10 rounded-xl">
                            <Cloud className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="mb-2 font-serif text-xl">No images found</p>
                            <p className="text-xs opacity-60">Upload your first product image above</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.map((image) => (
                                <button
                                    key={image.name}
                                    onClick={() => setSelectedImage(image.url)}
                                    className={`relative aspect-square rounded-xl overflow-hidden border-4 transition-all hover:scale-105 group ${selectedImage === image.url
                                        ? 'border-[#FDB723] shadow-lg ring-2 ring-[#FDB723]/30'
                                        : 'border-white shadow-sm hover:border-[#015030]/20'
                                        }`}
                                >
                                    <img
                                        src={image.url}
                                        alt={image.name}
                                        className="w-full h-full object-cover bg-white"
                                    />
                                    {selectedImage === image.url && (
                                        <div className="absolute inset-0 bg-[#FDB723]/20 flex items-center justify-center backdrop-blur-[1px]">
                                            <div className="w-12 h-12 bg-[#FDB723] rounded-full flex items-center justify-center shadow-lg transform scale-100 transition-transform">
                                                <Check className="w-6 h-6 text-[#015030]" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <p className="text-white text-[10px] truncate font-medium">{image.name}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-[#015030]/10 flex justify-between items-center bg-white z-10">
                    <p className="text-sm text-[#015030]/60 font-medium">
                        {selectedImage ? 'Image selected' : 'No image selected'}
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="px-8 py-3 border border-[#015030]/20 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#015030]/5 transition-colors text-[#015030]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSelect}
                            disabled={!selectedImage}
                            className="px-8 py-3 bg-[#FDB723] text-[#015030] rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
                        >
                            Confirm Selection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
