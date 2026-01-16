"use client";

import { useEffect, useState } from 'react';
import { LegalDocument } from '../types';
import Link from 'next/link';
import { Edit } from 'lucide-react';

export default function LegalList() {
    const [docs, setDocs] = useState<LegalDocument[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/legal')
            .then(res => res.json())
            .then(data => {
                setDocs(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-[#015030]">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-[#015030] p-8 font-sans">
            <header className="max-w-6xl mx-auto flex justify-between items-center mb-16 pt-8">
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-sm uppercase tracking-[0.2em] font-bold text-[#015030]/60 hover:text-[#015030]">
                        ← Dashboard
                    </Link>
                    <h1 className="text-4xl font-serif font-semibold">Legal Documents</h1>
                </div>
            </header>

            <main className="max-w-6xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl border border-[#015030]/10 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-[#015030] text-white text-sm uppercase tracking-[0.2em] font-medium">
                            <tr>
                                <th className="p-8 font-normal">Page Title</th>
                                <th className="p-8 font-normal">Last Updated</th>
                                <th className="p-8 text-right font-normal">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#015030]/10">
                            {docs.map((doc) => (
                                <tr key={doc.id} className="hover:bg-[#FDB723]/5 transition-colors group">
                                    <td className="p-8">
                                        <div className="font-serif text-xl font-semibold text-[#015030] mb-1">{doc.title}</div>
                                        <div className="text-sm text-[#015030]/50 tracking-wider font-mono">/{doc.slug}</div>
                                    </td>
                                    <td className="p-8 font-medium text-[#015030]/80">
                                        {doc.lastUpdated}
                                    </td>
                                    <td className="p-8 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <Link href={`/legal/edit/${doc.id}`} className="p-3 bg-[#FDFBF7] border border-[#015030]/10 rounded-full hover:bg-[#FDB723] transition-colors text-[#015030]">
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {docs.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-12 text-center text-[#015030]/40 italic">
                                        No legal documents found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
