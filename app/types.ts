export interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    category: 'Hair' | 'Skin' | 'Set';
    description: string;
    benefits: string[];
    ingredients: string[];
    ingredient_ids?: string[]; // IDs of linked ingredients from ingredients table
    keyIngredients?: string[]; // IDs from the master ingredient list
    image: string;
}

export interface BlogPost {
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

export interface LegalDocument {
    id: string;
    title: string;
    slug: string;
    content: string;
    lastUpdated: string;
}
