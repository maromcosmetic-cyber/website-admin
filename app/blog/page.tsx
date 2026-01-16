"use client";

import { useEffect, useState } from 'react';
import { BlogPost } from '../types';
import Link from 'next/link';
import { Edit, Plus, Trash2 } from 'lucide-react';

export default function BlogList() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/blog')
            .then(res => res.json())
            .then(data => {
                setPosts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        const updatedPosts = posts.filter(p => p.id !== id);

        try {
            await fetch('/api/blog', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPosts),
            });
            setPosts(updatedPosts);
        } catch (e) {
            console.error(e);
            alert('Failed to delete');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-[#015030]">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-[#015030] p-8 font-sans">
            <header className="max-w-6xl mx-auto flex justify-between items-center mb-16 pt-8">
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-sm uppercase tracking-[0.2em] font-bold text-[#015030]/60 hover:text-[#015030]">
                        ← Dashboard
                    </Link>
                    <h1 className="text-4xl font-serif font-semibold">Blog Posts</h1>
                </div>
                <Link href="/blog/new" className="inline-flex items-center gap-2 px-8 py-3 bg-[#FDB723] text-[#015030] rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-md">
                    <Plus className="w-4 h-4" /> New Post
                </Link>
            </header>

            <main className="max-w-6xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl border border-[#015030]/10 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-[#015030] text-white text-sm uppercase tracking-[0.2em] font-medium">
                            <tr>
                                <th className="p-8 font-normal">Title</th>
                                <th className="p-8 font-normal">Date</th>
                                <th className="p-8 font-normal">Author</th>
                                <th className="p-8 text-right font-normal">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#015030]/10">
                            {posts.map((post) => (
                                <tr key={post.id} className="hover:bg-[#FDB723]/5 transition-colors group">
                                    <td className="p-8">
                                        <div className="font-serif text-xl font-semibold text-[#015030] mb-1">{post.title}</div>
                                        <div className="text-sm text-[#015030]/50 tracking-wider font-mono">/{post.slug}</div>
                                    </td>
                                    <td className="p-8 font-medium text-[#015030]/80">
                                        {post.date}
                                    </td>
                                    <td className="p-8 text-[#015030]">
                                        <span className="px-3 py-1 bg-[#FDFBF7] border border-[#015030]/10 rounded-full text-xs font-bold uppercase tracking-wider">
                                            {post.author}
                                        </span>
                                    </td>
                                    <td className="p-8 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <Link href={`/blog/edit/${post.id}`} className="p-3 bg-[#FDFBF7] border border-[#015030]/10 rounded-full hover:bg-[#FDB723] transition-colors text-[#015030]">
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="p-3 bg-[#FDFBF7] border border-[#015030]/10 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors text-[#015030]/40"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {posts.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-[#015030]/40 italic">
                                        No blog posts yet. Create your first one!
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
