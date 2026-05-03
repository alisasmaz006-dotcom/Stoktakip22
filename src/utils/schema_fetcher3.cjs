const url = "https://xtjvbkhappiceyrlovkx.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0anZia2hhcHBpY2V5cmxvdmt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTUzNTksImV4cCI6MjA4MjIzMTM1OX0.bUSQ4nkoasOVQdtQwGSxtXiLGbyV9Ih8qlf-sGg3LCg";

async function checkRows() {
    try {
        const fetchTable = async (table) => {
            const res = await fetch(`${url}/rest/v1/${table}`, {
                headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
            });
            return res.json();
        };

        const [suppliers, purchases, products] = await Promise.all([
            fetchTable('suppliers'),
            fetchTable('purchases'),
            fetchTable('products')
        ]);

        console.log("Suppliers with non-UUID:");
        console.log(suppliers.filter(s => !s.id?.includes('-')).map(s => s.id));

        console.log("Purchases with non-UUID supplier_id:");
        console.log(purchases.filter(p => p.supplier_id && !p.supplier_id.includes('-')).map(p => p.supplier_id));

        console.log("Products with non-UUID id:");
        console.log(products.filter(p => !p.id?.includes('-')).map(p => p.id));
    } catch (e) {
        console.error(e);
    }
}
checkRows();
