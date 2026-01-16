"use client";

import { useEffect, useState } from 'react';
import { LegalDocument } from '../../../types';
import LegalEditor from '../../../components/LegalEditor';
import { use } from 'react';

export default function EditLegalPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [doc, setDoc] = useState<LegalDocument | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all docs and find the one (since currently API returns all)
        // Optimization: API could support getting single by ID, but for ~8 items file read is fine.
        fetch('/api/legal')
            .then(res => res.json())
            .then((data: LegalDocument[]) => {
                console.log('Looking for ID:', resolvedParams.id, 'in', data.map(d => d.id));
                const found = data.find(p => p.id === resolvedParams.id);
                setDoc(found || null);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [resolvedParams.id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-[#015030]">Loading...</div>;
    if (!doc) return <div className="min-h-screen flex items-center justify-center text-[#015030]">Document not found</div>;

    return <LegalEditor initialDoc={doc} />;
}
