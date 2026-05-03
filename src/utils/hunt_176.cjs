const url = "https://xtjvbkhappiceyrlovkx.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0anZia2hhcHBpY2V5cmxvdmt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTUzNTksImV4cCI6MjA4MjIzMTM1OX0.bUSQ4nkoasOVQdtQwGSxtXiLGbyV9Ih8qlf-sGg3LCg";

async function hunt() {
    try {
        const fetchTable = async (table) => {
            const res = await fetch(`${url}/rest/v1/${table}`, {
                headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
            });
            if (!res.ok) return [];
            return res.json();
        };

        const tables = ['suppliers', 'purchases', 'products', 'purchase_items', 'cari_hareketler', 'payments', 'sales', 'sale_items', 'customers'];
        for (const t of tables) {
            const data = await fetchTable(t);
            let found = 0;
            data.forEach(row => {
                for (const k of Object.keys(row)) {
                    if (typeof row[k] === 'string' && row[k].startsWith('176')) {
                        console.log(`FOUND in ${t} -> ${k}: ${row[k]}`);
                        found++;
                    }
                }
            });
            if (found === 0) console.log(`Clean: ${t}`);
        }
    } catch (e) {
        console.error(e);
    }
}
hunt();
