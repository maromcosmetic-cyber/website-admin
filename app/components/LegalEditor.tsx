"use client";

import { useState } from 'react';
import { LegalDocument } from '../types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LegalEditor({ initialDoc }: { initialDoc: LegalDocument }) {
    const router = useRouter();
    const [doc, setDoc] = useState<LegalDocument>(initialDoc);
    const [saving, setSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // First get existing docs
            const res = await fetch('/api/legal');
            const currentDocs: LegalDocument[] = await res.json();

            // Update the specific doc
            const updatedDocs = currentDocs.map(d => d.id === doc.id ? { ...doc, lastUpdated: new Date().toISOString().split('T')[0] } : d);

            // Save all
            await fetch('/api/legal', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedDocs),
            });

            router.push('/legal');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Failed to save');
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-[#015030] p-8 pb-32 font-sans">
            <header className="max-w-4xl mx-auto mb-12 pt-8">
                <Link href="/legal" className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] font-bold text-[#015030]/60 hover:text-[#015030] transition-colors mb-6">
                    ← Back to List
                </Link>
                <h1 className="text-4xl font-serif font-semibold">Edit Legal Document</h1>
            </header>

            <main className="max-w-4xl mx-auto">
                <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-xl border border-[#015030]/10 p-12 space-y-10">

                    {/* Title & Slug */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-[0.2em] font-bold text-[#015030]/60">Title</label>
                            <input
                                type="text"
                                value={doc.title}
                                onChange={e => setDoc({ ...doc, title: e.target.value })}
                                className="w-full text-3xl font-serif text-[#015030] border-b-2 border-[#015030]/10 focus:border-[#FDB723] outline-none py-2 bg-transparent transition-colors placeholder:text-[#015030]/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-[0.2em] font-bold text-[#015030]/60">Slug (Read Only)</label>
                            <input
                                type="text"
                                value={doc.slug}
                                readOnly
                                className="w-full text-sm font-mono text-[#015030]/40 border-b-2 border-[#015030]/5 outline-none py-2 bg-transparent cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Content (HTML Editor) */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.2em] font-bold text-[#015030]/60">Content (HTML)</label>
                        <div className="border-2 border-[#015030]/10 rounded-lg overflow-hidden focus-within:border-[#FDB723] transition-colors">
                            <textarea
                                value={doc.content}
                                onChange={(e) => setDoc({ ...doc, content: e.target.value })}
                                placeholder="Write your HTML content here..."
                                className="w-full min-h-[500px] p-6 text-[#015030] text-base font-mono bg-white outline-none resize-y"
                            />
                        </div>
                        <p className="text-xs text-[#015030]/40 italic">You can use HTML tags for formatting. Changes will automatically update on the frontend pages.</p>
                    </div>

                    {/* Preview */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.2em] font-bold text-[#015030]/60">Preview</label>
                        <div className="border-2 border-[#015030]/10 rounded-lg p-6 bg-[#FDFBF7] min-h-[200px]">
                            <div 
                                className="prose prose-sm max-w-none text-[#015030]"
                                dangerouslySetInnerHTML={{ __html: doc.content }}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-8 flex justify-end gap-4">
                        <Link href="/legal" className="px-8 py-4 border border-[#015030]/20 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#015030]/5 transition-colors">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-10 py-4 bg-[#FDB723] text-[#015030] rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-lg disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Document'}
                        </button>
                    </div>

                </form>
            </main>
        </div>
    );
}
