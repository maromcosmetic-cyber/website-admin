"use client";

import { ExternalLink, Eye, Pencil } from 'lucide-react';
import Link from 'next/link';

const PAGES = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Shop / All Products', path: '/shop' },
    { name: 'Ingredients', path: '/ingredients' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Moringa', path: '/moringa' },
    { name: 'Contact', path: '/contact' },
];

export default function WebsitePages() {
    return (
        <div className="p-10 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif font-bold text-[#015030]">Website Pages</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#FDFBF7] border-b border-black/5 text-xs uppercase tracking-widest text-[#015030]/60">
                            <th className="p-6 font-semibold">Page Name</th>
                            <th className="p-6 font-semibold">Path</th>
                            <th className="p-6 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {PAGES.map((page) => (
                            <tr key={page.path} className="group hover:bg-[#FDFBF7] transition-colors">
                                <td className="p-6 font-medium text-[#015030]">{page.name}</td>
                                <td className="p-6 text-gray-500 font-mono text-sm">{page.path}</td>
                                <td className="p-6 flex justify-end gap-3">
                                    <Link
                                        href={`http://localhost:3000${page.path}`}
                                        target="_blank"
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-black/10 text-xs font-bold uppercase tracking-wider hover:bg-black/5 transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View
                                    </Link>
                                    <Link
                                        href={`http://localhost:3000${page.path}?edit=true`}
                                        target="_blank"
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FDB723] text-[#015030] text-xs font-bold uppercase tracking-wider hover:bg-[#e5a010] transition-colors shadow-sm"
                                    >
                                        <Pencil className="w-4 h-4" />
                                        Visual Edit
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
