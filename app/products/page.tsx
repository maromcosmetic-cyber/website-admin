"use client";

import { useEffect, useState } from 'react';
import { Product } from '../types';
import Link from 'next/link';
import { Edit, Package } from 'lucide-react'; // Assuming we can use icons, or we fallback to text

export default function ProductsList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-[#015030]">Loading...</div>;

    return (
        <div className="w-full">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-serif font-semibold text-[#015030]">Products</h1>
                <div className="text-sm tracking-[0.2em] uppercase font-bold text-[#015030]/60">Manage Catalog</div>
            </header>

            <div className="bg-white rounded-3xl shadow-xl border border-[#015030]/10 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[#015030] text-white text-sm uppercase tracking-[0.2em] font-medium">
                        <tr>
                            <th className="p-8 font-normal">Product</th>
                            <th className="p-8 font-normal">Category</th>
                            <th className="p-8 font-normal">Price</th>
                            <th className="p-8 text-right font-normal">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#015030]/10">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-[#FDB723]/5 transition-colors group">
                                <td className="p-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-[#FDFBF7] rounded-xl overflow-hidden relative shadow-sm border border-[#015030]/5">
                                            {product.image ? (
                                                <img src={product.image.startsWith('http') ? product.image : `http://localhost:3000${product.image}`} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[#015030]/30 font-serif italic">Img</div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-xl font-serif font-semibold text-[#015030] mb-1">{product.name}</div>
                                            <div className="text-sm text-[#015030]/50 tracking-wider uppercase">{product.slug}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-8">
                                    <span className="px-6 py-2 border border-[#015030]/30 rounded-full text-xs font-bold uppercase tracking-widest text-[#015030]">
                                        {product.category}
                                    </span>
                                </td>
                                <td className="p-8 font-serif text-xl font-medium text-[#015030]">
                                    ฿{product.price.toLocaleString()}
                                </td>
                                <td className="p-8 text-right">
                                    <Link href={`/edit/${product.id}`} className="inline-block px-8 py-3 bg-[#FDB723] text-[#015030] rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-md">
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
