const url = "https://xtjvbkhappiceyrlovkx.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0anZia2hhcHBpY2V5cmxvdmt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTUzNTksImV4cCI6MjA4MjIzMTM1OX0.bUSQ4nkoasOVQdtQwGSxtXiLGbyV9Ih8qlf-sGg3LCg";

async function querySchema() {
    console.log("Fetching information_schema...");
    const res = await fetch(`${url}/rest/v1/rpc/check_db_query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': key,
            'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
            query: `SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN ('suppliers', 'purchases', 'products', 'cari_hareketler', 'customers') AND column_name IN ('id', 'supplier_id', 'ilgili_id', 'customer_id');`
        })
    });

    if (!res.ok) {
        console.error(await res.text());
        return;
    }
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}

querySchema();
