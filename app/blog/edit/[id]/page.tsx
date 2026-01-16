"use client";

import { useEffect, useState, use } from 'react';
import { BlogPost } from '../../../types';
import BlogEditor from "../../../components/BlogEditor";

export default function EditPost({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/blog')
            .then(res => res.json())
            .then((data: BlogPost[]) => {
                const found = data.find(p => p.id === id);
                setPost(found || null);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-[#015030]">Loading...</div>;
    if (!post) return <div className="min-h-screen flex items-center justify-center text-[#015030]">Post not found</div>;

    return <BlogEditor initialPost={post} />;
}
