const url = "https://xtjvbkhappiceyrlovkx.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0anZia2hhcHBpY2V5cmxvdmt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTUzNTksImV4cCI6MjA4MjIzMTM1OX0.bUSQ4nkoasOVQdtQwGSxtXiLGbyV9Ih8qlf-sGg3LCg";

async function checkRows() {
    try {
        const fetchTable = async (table) => {
            const res = await fetch(`${url}/rest/v1/${table}?limit=1`, {
                headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
            });
            return res.json();
        };

        const [suppliers, purchases, cari, products] = await Promise.all([
            fetchTable('suppliers'),
            fetchTable('purchases'),
            fetchTable('cari_hareketler'),
            fetchTable('products')
        ]);

        console.log("Suppliers ID sample:", suppliers[0]?.id);
        console.log("Purchases ID sample:", purchases[0]?.id, " | Supplier ID:", purchases[0]?.supplier_id);
        console.log("CariHareket ID sample:", cari[0]?.id, " | Supplier ID:", cari[0]?.supplier_id, " | İlgili ID:", cari[0]?.ilgili_id);
        console.log("Products ID sample:", products[0]?.id);
    } catch (e) {
        console.error(e);
    }
}
checkRows();
