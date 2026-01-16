import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Hardcoded path to the Frontend's legal file
const LEGAL_FILE_PATH = path.resolve(process.cwd(), '../marom-frontend/app/data/legal.ts');

export async function GET() {
    try {
        const fileContent = fs.readFileSync(LEGAL_FILE_PATH, 'utf-8');

        // Extract the JSON-like array from the file content
        const match = fileContent.match(/export const legalDocuments: LegalDocument\[\] = (\[[\s\S]*\]);/);

        if (!match || !match[1]) {
            return NextResponse.json([]);
        }

        // Unsafe eval for Local CMS pattern
        const docs = eval(match[1]);

        return NextResponse.json(docs);
    } catch (error) {
        console.error('Error reading legal docs:', error);
        return NextResponse.json({ error: 'Failed to read legal docs' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const docs = await request.json();

        // Generate the TS file content
        const fileContent = `export interface LegalDocument {
    id: string;
    title: string;
    slug: string;
    content: string;
    lastUpdated: string;
}

export const legalDocuments: LegalDocument[] = ${JSON.stringify(docs, null, 4)};
`;

        fs.writeFileSync(LEGAL_FILE_PATH, fileContent, 'utf-8');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error writing legal docs:', error);
        return NextResponse.json({ error: 'Failed to write legal docs' }, { status: 500 });
    }
}
