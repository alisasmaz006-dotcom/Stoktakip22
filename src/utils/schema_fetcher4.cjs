const url = "https://xtjvbkhappiceyrlovkx.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0anZia2hhcHBpY2V5cmxvdmt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTUzNTksImV4cCI6MjA4MjIzMTM1OX0.bUSQ4nkoasOVQdtQwGSxtXiLGbyV9Ih8qlf-sGg3LCg";

async function forceFetch() {
    console.log("Fetching max rows from suppliers and purchases...");
    const resS = await fetch(`${url}/rest/v1/suppliers?limit=10000`, { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } });
    const resP = await fetch(`${url}/rest/v1/products?limit=10000`, { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } });
    const s = await resS.json();
    const p = await resP.json();

    let found = false;
    for (const sup of s) {
        if (JSON.stringify(sup).includes('176')) {
            console.log("FOUND IN SUPPLIERS:", sup);
            found = true;
        }
    }
    for (const prod of p) {
        if (JSON.stringify(prod).includes('176')) {
            console.log("FOUND IN PRODUCTS:", prod);
            found = true;
        }
    }
    if (!found) console.log("Absolutely nothing found with '176' in suppliers or products.");
}
forceFetch();
