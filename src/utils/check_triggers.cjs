const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
    const parts = line.split('=');
    if (parts.length >= 2) acc[parts[0].trim()] = parts.slice(1).join('=').trim();
    return acc;
}, {});

fetch(`${env.VITE_SUPABASE_URL}/rest/v1/rpc/check_db_query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: env.VITE_SUPABASE_ANON_KEY },
    body: JSON.stringify({ query: "SELECT event_object_table, trigger_name, action_statement FROM information_schema.triggers WHERE event_object_table = 'purchases'" })
})
    .then(r => r.json())
    .then(d => console.log(JSON.stringify(d, null, 2)))
    .catch(console.error);
