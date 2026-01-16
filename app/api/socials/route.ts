import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Hardcoded path to the Frontend's settings file
const SETTINGS_FILE_PATH = path.resolve('../marom-frontend/app/data/settings.ts');

export async function GET() {
    try {
        const fileContent = fs.readFileSync(SETTINGS_FILE_PATH, 'utf-8');

        // Extract the object from the file content
        const match = fileContent.match(/export const siteSettings: SiteSettings = ({[\s\S]*?});/);

        if (!match || !match[1]) {
            return NextResponse.json({});
        }

        // Unsafe eval for Local CMS pattern
        const settings = eval('(' + match[1] + ')');

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error reading settings:', error);
        return NextResponse.json({ error: 'Failed to read settings' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const settings = await request.json();

        // Generate the TS file content
        const fileContent = `export interface SiteSettings {
    socialLinks: {
        facebook: string;
        instagram: string;
        tiktok: string;
        youtube: string;
        whatsapp: string;
    };
    trustindexWidgetCode: string;
}

export const siteSettings: SiteSettings = ${JSON.stringify(settings, null, 4)};
`;

        fs.writeFileSync(SETTINGS_FILE_PATH, fileContent, 'utf-8');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error writing settings:', error);
        return NextResponse.json({ error: 'Failed to write settings' }, { status: 500 });
    }
}
