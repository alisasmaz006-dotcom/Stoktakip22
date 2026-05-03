const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
    const parts = line.split('=');
    if (parts.length >= 2) acc[parts[0].trim()] = parts.slice(1).join('=').trim();
    return acc;
}, {});

function checkEndpoint(path) {
    return fetch(`${env.VITE_SUPABASE_URL}/rest/v1/${path}`, {
        headers: { apikey: env.VITE_SUPABASE_ANON_KEY }
    })
        .then(r => r.json())
}

Promise.all([
    checkEndpoint('suppliers?select=id,name'),
    checkEndpoint('products?select=id,name')
]).then(([supps, prods]) => {
    console.log("Suppliers with non-UUID ids:");
    console.log((supps || []).filter(s => !s.id.includes('-')));
    console.log("Products with non-UUID ids:");
    console.log((prods || []).filter(p => !p.id.includes('-')));
}).catch(console.error);
