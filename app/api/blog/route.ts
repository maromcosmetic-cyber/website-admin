import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { BlogPost } from '../../types';

// Hardcoded path to the Frontend's blog file
const BLOG_FILE_PATH = path.resolve('../marom-frontend/app/data/blog.ts');

export async function GET() {
    try {
        const fileContent = fs.readFileSync(BLOG_FILE_PATH, 'utf-8');

        // Extract the JSON-like array from the file content
        const match = fileContent.match(/export const blogPosts: BlogPost\[\] = (\[[\s\S]*\]);/);

        if (!match || !match[1]) {
            // If empty or parsing fails, return empty array
            return NextResponse.json([]);
        }

        // Unsafe eval for Local CMS pattern (same as products)
        const posts = eval(match[1]);

        return NextResponse.json(posts);
    } catch (error) {
        console.error('Error reading blog posts:', error);
        return NextResponse.json({ error: 'Failed to read blog posts' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const posts: BlogPost[] = await request.json();

        // Generate the TS file content
        const fileContent = `export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    image: string;
    date: string;
    author: string;
    tags: string[];
}

export const blogPosts: BlogPost[] = ${JSON.stringify(posts, null, 4)};
`;

        fs.writeFileSync(BLOG_FILE_PATH, fileContent, 'utf-8');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error writing blog posts:', error);
        return NextResponse.json({ error: 'Failed to write blog posts' }, { status: 500 });
    }
}
