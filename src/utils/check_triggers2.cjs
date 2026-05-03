const url = "https://xtjvbkhappiceyrlovkx.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0anZia2hhcHBpY2V5cmxvdmt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTUzNTksImV4cCI6MjA4MjIzMTM1OX0.bUSQ4nkoasOVQdtQwGSxtXiLGbyV9Ih8qlf-sGg3LCg";

async function queryTriggers() {
    console.log("Fetching triggers using a custom sql function inside the edge function...");
    const res = await fetch(`${url}/functions/v1/make-server-929c4905/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({
            query: `SELECT event_object_table, trigger_name, action_statement FROM information_schema.triggers WHERE event_object_table IN ('purchases', 'cari_hareketler')`
        })
    });

    if (!res.ok) {
        console.error(await res.text());
        return;
    }
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}

queryTriggers();
