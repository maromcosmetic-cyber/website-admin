"use client";

import { useEffect, useState } from 'react';
import { ShoppingBag, BookOpen, Users, ArrowUpRight } from 'lucide-react';
import { BlogPost, Product } from './types';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, posts: 0 });

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/blog').then(res => res.json())
    ]).then(([productsData, blogData]) => {
      setStats({
        products: Array.isArray(productsData) ? productsData.length : 0,
        posts: Array.isArray(blogData) ? blogData.length : 0
      });
    }).catch(console.error);
  }, []);

  return (
    <div className="w-full text-[#015030]">
      <header className="mb-12">
        <h1 className="text-4xl font-serif font-semibold">Dashboard</h1>
        <p className="text-sm tracking-widest uppercase text-[#015030]/60 mt-2">Welcome back, Admin</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Product Stat */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-[#015030]/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-[#015030]/10 group-hover:text-[#FDB723]/20 transition-colors">
            <ShoppingBag className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="text-5xl font-serif font-bold mb-2">{stats.products}</div>
            <div className="text-xs uppercase tracking-[0.2em] font-bold text-[#015030]/60">Total Products</div>
          </div>
        </div>

        {/* Blog Stat */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-[#015030]/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-[#015030]/10 group-hover:text-[#FDB723]/20 transition-colors">
            <BookOpen className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="text-5xl font-serif font-bold mb-2">{stats.posts}</div>
            <div className="text-xs uppercase tracking-[0.2em] font-bold text-[#015030]/60">Blog Posts</div>
          </div>
        </div>

        {/* Visitors Stat (Mock) */}
        <div className="bg-[#015030] text-[#FDFBF7] p-8 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-5xl font-serif font-bold mb-2">1.2k</div>
            <div className="text-xs uppercase tracking-[0.2em] font-bold text-[#FDB723]">Monthly Visitors</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-10 shadow-xl border border-[#015030]/5">
        <h2 className="text-2xl font-serif font-semibold mb-6">Quick Actions</h2>
        <div className="flex gap-4">
          <a href="/products" className="px-8 py-4 bg-[#FDB723] text-[#015030] rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-md">
            Manage Products
          </a>
          <a href="/blog/new" className="px-8 py-4 border border-[#015030]/20 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#015030] hover:text-[#FDB723] transition-colors">
            Write New Post
          </a>
        </div>
      </div>
    </div>
  );
}
