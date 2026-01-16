import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface Ingredient {
    id: string;
    name: string;
    image: string;
    description: string;
    benefits: string;
    order: number;
}

// Hardcoded path to the Frontend's ingredients file
const INGREDIENTS_FILE_PATH = path.resolve('../marom-frontend/app/data/ingredients.ts');

export async function GET() {
    try {
        if (!fs.existsSync(INGREDIENTS_FILE_PATH)) {
            return NextResponse.json([]);
        }
        const fileContent = fs.readFileSync(INGREDIENTS_FILE_PATH, 'utf-8');

        // Regex to extract the array
        const match = fileContent.match(/export const ingredients: Ingredient\[\] = (\[[\s\S]*\]);/);

        if (!match || !match[1]) {
            // Fallback if empty or not found, return empty array
            return NextResponse.json([]);
        }

        // Unsafe eval for local file reading
        const ingredients = eval(match[1]);
        return NextResponse.json(ingredients);
    } catch (error) {
        console.error('Error reading ingredients:', error);
        return NextResponse.json({ error: 'Failed to read ingredients' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const ingredients: Ingredient[] = await request.json();

        const fileContent = `export interface Ingredient {
    id: string;
    name: string;
    image: string;
    description: string;
    benefits: string;
    order: number;
}

export const ingredients: Ingredient[] = ${JSON.stringify(ingredients, null, 4)};
`;

        fs.writeFileSync(INGREDIENTS_FILE_PATH, fileContent, 'utf-8');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error writing ingredients:', error);
        return NextResponse.json({ error: 'Failed to write ingredients' }, { status: 500 });
    }
}
