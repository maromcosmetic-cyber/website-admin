"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Server, Lock, User, Palette } from 'lucide-react';

export default function SettingsPage() {
    // SMTP STATE
    const [smtpConfig, setSmtpConfig] = useState({
        host: '',
        port: 587,
        user: '',
        pass: '',
        fromEmail: ''
    });

    // BRAND STATE
    const [brandConfig, setBrandConfig] = useState({
        primary: '#015030', // Marom Green
        secondary: '#FDB723', // Marom Gold
        background: '#FDFBF7', // Cream
        text: '#1F2937', // Dark Gray
        accent: '#E5E7EB' // Light Gray
    });

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // TEST EMAIL STATE
    const [testEmail, setTestEmail] = useState('');
    const [testing, setTesting] = useState(false);
    const [testMessage, setTestMessage] = useState('');

    // Load existing settings
    useEffect(() => {
        async function loadSettings() {
            // Load SMTP
            const { data: smtpData } = await supabase
                .from('content_blocks')
                .select('content')
                .eq('section_key', 'smtp_config')
                .single();

            if (smtpData?.content) {
                try {
                    setSmtpConfig(JSON.parse(smtpData.content));
                } catch (e) { console.error("Error parsing SMTP", e); }
            }

            // Load Brand
            const { data: brandData } = await supabase
                .from('content_blocks')
                .select('content')
                .eq('section_key', 'global_brand_settings')
                .single();

            if (brandData?.content) {
                try {
                    setBrandConfig(JSON.parse(brandData.content));
                } catch (e) { console.error("Error parsing Brand", e); }
            }
        }
        loadSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // Save SMTP
        const { error: smtpError } = await supabase
            .from('content_blocks')
            .upsert({
                section_key: 'smtp_config',
                content: JSON.stringify(smtpConfig),
                updated_at: new Date().toISOString()
            }, { onConflict: 'section_key' });

        // Save Brand
        const { error: brandError } = await supabase
            .from('content_blocks')
            .upsert({
                section_key: 'global_brand_settings',
                content: JSON.stringify(brandConfig),
                updated_at: new Date().toISOString()
            }, { onConflict: 'section_key' });

        if (smtpError || brandError) {
            const err = smtpError || brandError;
            setMessage(`Error: ${err?.message || 'Unknown error'}`);
            console.error("Save Error:", err);
        } else {
            setMessage('All Settings saved successfully.');
        }
        setLoading(false);
    };

    const handleTestEmail = async () => {
        if (!testEmail) {
            setTestMessage('Please enter an email address to receive the test.');
            return;
        }
        setTesting(true);
        setTestMessage('');

        try {
            const res = await fetch('/api/test-smtp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    host: smtpConfig.host,
                    port: smtpConfig.port,
                    user: smtpConfig.user,
                    pass: smtpConfig.pass,
                    fromEmail: smtpConfig.fromEmail,
                    toEmail: testEmail
                })
            });

            const data = await res.json();

            if (res.ok) {
                setTestMessage('Success: ' + data.message);
            } else {
                setTestMessage('Error: ' + data.error);
            }
        } catch (error) {
            setTestMessage('Error: Failed to connect to server.');
            console.error(error);
        }
        setTesting(false);
    };

    return (
        <div className="w-full text-[#015030] p-8 pb-32">
            <header className="mb-12">
                <h1 className="text-4xl font-serif font-semibold">Settings</h1>
                <p className="text-sm tracking-widest uppercase text-[#015030]/60 mt-2">Configure System & Brand Identity</p>
            </header>

            <form onSubmit={handleSave} className="space-y-10 max-w-4xl">

                {/* --- BRAND IDENTITY SECTION --- */}
                <div className="bg-white rounded-3xl shadow-xl border border-[#015030]/5 p-10">
                    <h2 className="text-2xl font-serif font-semibold mb-8 flex items-center gap-3">
                        <Palette className="w-6 h-6 text-[#FDB723]" />
                        Brand Identity (Global Colors)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Primary */}
                        <div className="space-y-2">
                            <label className="block text-xs uppercase tracking-widest font-bold">Primary Color</label>
                            <div className="flex items-center gap-3 p-3 bg-[#F8F5F2] rounded-xl border border-[#015030]/10">
                                <input
                                    type="color"
                                    value={brandConfig.primary}
                                    onChange={(e) => setBrandConfig({ ...brandConfig, primary: e.target.value })}
                                    className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                                />
                                <span className="font-mono text-sm opacity-60">{brandConfig.primary}</span>
                            </div>
                        </div>

                        {/* Secondary */}
                        <div className="space-y-2">
                            <label className="block text-xs uppercase tracking-widest font-bold">Secondary (Gold)</label>
                            <div className="flex items-center gap-3 p-3 bg-[#F8F5F2] rounded-xl border border-[#015030]/10">
                                <input
                                    type="color"
                                    value={brandConfig.secondary}
                                    onChange={(e) => setBrandConfig({ ...brandConfig, secondary: e.target.value })}
                                    className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                                />
                                <span className="font-mono text-sm opacity-60">{brandConfig.secondary}</span>
                            </div>
                        </div>

                        {/* Background */}
                        <div className="space-y-2">
                            <label className="block text-xs uppercase tracking-widest font-bold">Background (Cream)</label>
                            <div className="flex items-center gap-3 p-3 bg-[#F8F5F2] rounded-xl border border-[#015030]/10">
                                <input
                                    type="color"
                                    value={brandConfig.background}
                                    onChange={(e) => setBrandConfig({ ...brandConfig, background: e.target.value })}
                                    className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                                />
                                <span className="font-mono text-sm opacity-60">{brandConfig.background}</span>
                            </div>
                        </div>

                        {/* Text */}
                        <div className="space-y-2">
                            <label className="block text-xs uppercase tracking-widest font-bold">Body Text</label>
                            <div className="flex items-center gap-3 p-3 bg-[#F8F5F2] rounded-xl border border-[#015030]/10">
                                <input
                                    type="color"
                                    value={brandConfig.text}
                                    onChange={(e) => setBrandConfig({ ...brandConfig, text: e.target.value })}
                                    className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                                />
                                <span className="font-mono text-sm opacity-60">{brandConfig.text}</span>
                            </div>
                        </div>

                        {/* Accent */}
                        <div className="space-y-2">
                            <label className="block text-xs uppercase tracking-widest font-bold">Accent / Gray</label>
                            <div className="flex items-center gap-3 p-3 bg-[#F8F5F2] rounded-xl border border-[#015030]/10">
                                <input
                                    type="color"
                                    value={brandConfig.accent}
                                    onChange={(e) => setBrandConfig({ ...brandConfig, accent: e.target.value })}
                                    className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                                />
                                <span className="font-mono text-sm opacity-60">{brandConfig.accent}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- SMTP SECTION --- */}
                <div className="bg-white rounded-3xl shadow-xl border border-[#015030]/5 p-10">
                    <h2 className="text-2xl font-serif font-semibold mb-8 flex items-center gap-3">
                        <Server className="w-6 h-6 text-[#FDB723]" />
                        SMTP Server Configuration
                    </h2>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs uppercase tracking-widest font-bold mb-2">SMTP Host</label>
                                <input
                                    type="text"
                                    className="w-full p-4 bg-[#F8F5F2] rounded-xl border border-[#015030]/10 focus:border-[#FDB723] outline-none transition-colors"
                                    placeholder="smtp.gmail.com"
                                    value={smtpConfig.host}
                                    onChange={e => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs uppercase tracking-widest font-bold mb-2">Port</label>
                                <input
                                    type="number"
                                    className="w-full p-4 bg-[#F8F5F2] rounded-xl border border-[#015030]/10 focus:border-[#FDB723] outline-none transition-colors"
                                    placeholder="587"
                                    value={smtpConfig.port}
                                    onChange={e => setSmtpConfig({ ...smtpConfig, port: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-widest font-bold mb-2">Sender Email (From)</label>
                            <input
                                type="email"
                                className="w-full p-4 bg-[#F8F5F2] rounded-xl border border-[#015030]/10 focus:border-[#FDB723] outline-none transition-colors"
                                placeholder="hello@marom.com"
                                value={smtpConfig.fromEmail}
                                onChange={e => setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs uppercase tracking-widest font-bold mb-2">SMTP User</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#015030]/40" />
                                    <input
                                        type="text"
                                        className="w-full p-4 pl-12 bg-[#F8F5F2] rounded-xl border border-[#015030]/10 focus:border-[#FDB723] outline-none transition-colors"
                                        placeholder="Username"
                                        value={smtpConfig.user}
                                        onChange={e => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs uppercase tracking-widest font-bold mb-2">SMTP Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#015030]/40" />
                                    <input
                                        type="password"
                                        className="w-full p-4 pl-12 bg-[#F8F5F2] rounded-xl border border-[#015030]/10 focus:border-[#FDB723] outline-none transition-colors"
                                        placeholder="••••••••"
                                        value={smtpConfig.pass}
                                        onChange={e => setSmtpConfig({ ...smtpConfig, pass: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Test Connection Section */}
                    <div className="mt-8 pt-8 border-t border-[#015030]/10">
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Test Connection</h3>
                        <div className="flex gap-4 items-start">
                            <div className="flex-grow">
                                <input
                                    type="email"
                                    className="w-full p-4 bg-[#F8F5F2] rounded-xl border border-[#015030]/10 focus:border-[#FDB723] outline-none transition-colors"
                                    placeholder="Enter email to receive test..."
                                    value={testEmail}
                                    onChange={e => setTestEmail(e.target.value)}
                                />
                                {testMessage && (
                                    <p className={`text-xs mt-2 font-bold ${testMessage.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>
                                        {testMessage}
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handleTestEmail}
                                disabled={testing || !testEmail}
                                className="px-6 py-4 bg-[#FDB723] text-[#015030] rounded-xl text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-50"
                            >
                                {testing ? 'Sending...' : 'Send Test'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- SAVE BUTTON --- */}
                <div className="fixed bottom-0 left-80 right-0 p-6 bg-white border-t border-black/5 flex items-center justify-between z-40">
                    <p className={`text-sm font-bold ${message.includes('Error') ? 'text-red-500' : 'text-[#015030]'}`}>
                        {message}
                    </p>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-4 bg-[#015030] text-[#FDB723] rounded-full text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2 shadow-xl"
                    >
                        <Save className="w-5 h-5" />
                        {loading ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>

            </form>
        </div>
    );
}
