"use client";

import { useState } from 'react';
import { BlogPost } from '../types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BlogEditor({ initialPost, isNew = false }: { initialPost?: BlogPost, isNew?: boolean }) {
    const router = useRouter();
    const [post, setPost] = useState<BlogPost>(initialPost || {
        id: crypto.randomUUID(),
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        image: '',
        date: new Date().toISOString().split('T')[0],
        author: 'Marom Team',
        tags: []
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // First get existing posts
            const res = await fetch('/api/blog');
            const currentPosts: BlogPost[] = await res.json();

            let updatedPosts;
            if (isNew) {
                updatedPosts = [...currentPosts, post];
            } else {
                updatedPosts = currentPosts.map(p => p.id === post.id ? post : p);
            }

            // Save all
            await fetch('/api/blog', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPosts),
            });

            router.push('/blog');
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
                <Link href="/blog" className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] font-bold text-[#015030]/60 hover:text-[#015030] transition-colors mb-6">
                    ← Back to List
                </Link>
                <h1 className="text-4xl font-serif font-semibold">{isNew ? 'New Post' : 'Edit Post'}</h1>
            </header>

            <main className="max-w-4xl mx-auto">
                <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-xl border border-[#015030]/10 p-12 space-y-10">

                    {/* Title & Slug */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-[0.2em] font-bold text-[#015030]/60">Title</label>
                            <input
                                type="text"
                                value={post.title}
                                onChange={e => {
                                    const title = e.target.value;
                                    // Auto-generate slug from title if new
                                    const slug = isNew ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : post.slug;
                                    setPost({ ...post, title, slug });
                                }}
                                className="w-full text-3xl font-serif text-[#015030] border-b-2 border-[#015030]/10 focus:border-[#FDB723] outline-none py-2 bg-transparent transition-colors placeholder:text-[#015030]/20"
                                placeholder="Enter post title..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-[0.2em] font-bold text-[#015030]/60">Slug (URL)</label>
                            <input
                                type="text"
                                value={post.slug}
                                onChange={e => setPost({ ...post, slug: e.target.value })}
                                className="w-full text-sm font-mono text-[#015030]/80 border-b-2 border-[#015030]/10 focus:border-[#FDB723] outline-none py-2 bg-transparent transition-colors"
                            />
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.2em] font-bold text-[#015030]/60">Excerpt (Short Summary)</label>
                        <textarea
                            value={post.excerpt}
                            onChange={e => setPost({ ...post, excerpt: e.target.value })}
                            className="w-full text-lg leading-relaxed text-[#015030]/80 border-b-2 border-[#015030]/10 focus:border-[#FDB723] outline-none py-2 bg-transparent min-h-[80px] resize-none transition-colors"
                        />
                    </div>

                    {/* Content (HTML) */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.2em] font-bold text-[#015030]/60">Content (HTML Supported)</label>
                        <textarea
                            value={post.content}
                            onChange={e => setPost({ ...post, content: e.target.value })}
                            className="w-full text-base font-mono leading-relaxed text-[#015030]/80 border-2 border-[#015030]/10 rounded-lg p-4 focus:border-[#FDB723] outline-none bg-[#FDFBF7]/50 min-h-[400px] transition-colors"
                            placeholder="<p>Write your content here...</p>"
                        />
                        <p className="text-xs text-[#015030]/40 italic">Minimal HTML supported: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;</p>
                    </div>

                    {/* Meta */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-[0.2em] font-bold text-[#015030]/60">Cover Image URL</label>
                            <input
                                type="text"
                                value={post.image}
                                onChange={e => setPost({ ...post, image: e.target.value })}
                                className="w-full text-base text-[#015030] border-b-2 border-[#015030]/10 focus:border-[#FDB723] outline-none py-2 bg-transparent transition-colors"
                                placeholder="/images/..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-[0.2em] font-bold text-[#015030]/60">Tags (comma separated)</label>
                            <input
                                type="text"
                                value={post.tags.join(', ')}
                                onChange={e => setPost({ ...post, tags: e.target.value.split(',').map(s => s.trim()) })}
                                className="w-full text-base text-[#015030] border-b-2 border-[#015030]/10 focus:border-[#FDB723] outline-none py-2 bg-transparent transition-colors"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-8 flex justify-end gap-4">
                        <Link href="/blog" className="px-8 py-4 border border-[#015030]/20 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#015030]/5 transition-colors">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-10 py-4 bg-[#FDB723] text-[#015030] rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-lg disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Post'}
                        </button>
                    </div>

                </form>
            </main>
        </div>
    );
}
