
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkIngredients() {
    console.log("Checking 'ingredients' table...");
    const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error accessing ingredients table:", error.message);
    } else {
        console.log("Success! Table exists.");
        console.log("Sample Data:", data);
    }

    console.log("Checking 'products' table for 'ingredient_ids'...");
    const { data: products, error: prodError } = await supabase
        .from('products')
        .select('ingredient_ids')
        .limit(1);

    if (prodError) {
        console.log("Could not select ingredient_ids from products (Expected if column missing):", prodError.message);
    } else {
        console.log("Success! Products table has ingredient_ids.");
    }
}

checkIngredients();
