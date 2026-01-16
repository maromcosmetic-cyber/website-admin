import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const productsDir = path.join(process.cwd(), '../marom-frontend/public/images/products');

        if (!fs.existsSync(productsDir)) {
            return NextResponse.json([]);
        }

        const files = fs.readdirSync(productsDir);

        // Filter for image files only
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
        const images = files
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return imageExtensions.includes(ext);
            })
            .map(file => ({
                filename: file,
                path: `/images/products/${file}`
            }));

        return NextResponse.json(images);
    } catch (error) {
        console.error('Error reading product images:', error);
        return NextResponse.json({ error: 'Failed to read images' }, { status: 500 });
    }
}
