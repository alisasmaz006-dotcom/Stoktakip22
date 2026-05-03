const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
    const parts = line.split('=');
    if (parts.length >= 2) acc[parts[0].trim()] = parts.slice(1).join('=').trim();
    return acc;
}, {});

fetch(`${env.VITE_SUPABASE_URL}/rest/v1/?apikey=${env.VITE_SUPABASE_ANON_KEY}`, {
    headers: { apikey: env.VITE_SUPABASE_ANON_KEY }
})
    .then(r => r.json())
    .then(d => {
        console.log(Object.keys(d.definitions.purchases.properties));
    })
    .catch(console.error);
