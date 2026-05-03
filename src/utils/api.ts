import type {
    Category, Product, Sale, RepairRecord, PhoneSale, PhoneStock,
    Expense, CustomerRequest, Supplier, Purchase, PurchaseItem, CariHareket, Payment, Customer,
    WarrantyRecord, Technician, RepairAppointment, AppUser, Branch, BranchSettings
} from '../types';

const SUPABASE_URL = 'https://tyijizjzmcmxoqlqrufd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5aWppemp6bWNteG9xbHFydWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MzA3MDEsImV4cCI6MjA5MjIwNjcwMX0.SM9tYFoye8kdhSeI95qsrdns-xf7sVoDUalqWJPoV6Y';

// ── Supabase REST helpers ──

async function dbFetch(path: string, options?: RequestInit) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=representation',
            ...options?.headers,
        },
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`DB Error ${res.status}: ${text}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

// ── snake_case <-> camelCase mappers ──

function snakeToCamel(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
        const camelKey = key.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
        result[camelKey] = obj[key];
    }
    return result;
}

function camelToSnake(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
        const snakeKey = key.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`);
        result[snakeKey] = obj[key];
    }
    return result;
}

// ══════════════════════════════════════
// AUTH FUNCTIONS
// ══════════════════════════════════════

export async function getUserByPin(pinCode: string): Promise<AppUser | null> {
    const data = await dbFetch(`/app_users?pin_code=eq.${pinCode}&is_active=eq.true`);
    if (!data || data.length === 0) return null;
    return snakeToCamel(data[0]) as unknown as AppUser;
}

export async function getUsers(): Promise<AppUser[]> {
    const data = await dbFetch('/app_users?order=created_at.asc');
    return (data || []).map((u: Record<string, unknown>) => snakeToCamel(u) as unknown as AppUser);
}

export async function createUser(user: Omit<AppUser, 'id' | 'createdAt'>): Promise<AppUser> {
    const data = await dbFetch('/app_users', {
        method: 'POST',
        body: JSON.stringify(camelToSnake(user as unknown as Record<string, unknown>)),
    });
    return snakeToCamel(Array.isArray(data) ? data[0] : data) as unknown as AppUser;
}

export async function updateUser(id: string, updates: Partial<AppUser>): Promise<void> {
    await dbFetch(`/app_users?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify(camelToSnake(updates as unknown as Record<string, unknown>)),
    });
}

export async function deleteUser(id: string): Promise<void> {
    await dbFetch(`/app_users?id=eq.${id}`, { method: 'DELETE' });
}

// ══════════════════════════════════════
// BRANCH FUNCTIONS
// ══════════════════════════════════════

export async function getBranches(): Promise<Branch[]> {
    const data = await dbFetch('/branches?is_active=eq.true&order=created_at.asc');
    return (data || []).map((b: Record<string, unknown>) => snakeToCamel(b) as unknown as Branch);
}

export async function updateBranch(id: string, updates: Partial<Branch>): Promise<void> {
    await dbFetch(`/branches?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify(camelToSnake(updates as unknown as Record<string, unknown>)),
    });
}

// ══════════════════════════════════════
// BRANCH SETTINGS FUNCTIONS
// ══════════════════════════════════════

export async function getBranchSettings(branchId: string): Promise<BranchSettings | null> {
    const data = await dbFetch(`/branch_settings?branch_id=eq.${branchId}`);
    if (!data || data.length === 0) return null;
    return snakeToCamel(data[0]) as unknown as BranchSettings;
}

export async function updateBranchSettings(branchId: string, updates: Partial<BranchSettings>): Promise<void> {
    await dbFetch(`/branch_settings?branch_id=eq.${branchId}`, {
        method: 'PATCH',
        body: JSON.stringify(camelToSnake(updates as unknown as Record<string, unknown>)),
    });
}

// ══════════════════════════════════════
// PUBLIC API — Categories
// ══════════════════════════════════════

export async function getCategories(branchId?: string): Promise<Category[]> {
    const filter = branchId ? `&branch_id=eq.${branchId}` : '';
    const data = await dbFetch(`/categories?order=name.asc${filter}`);
    return (data || []).map((d: Record<string, unknown>) => snakeToCamel(d) as unknown as Category);
}
export async function saveCategory(cat: Category & { branchId?: string }) {
    const payload = camelToSnake(cat as unknown as Record<string, unknown>);
    delete payload['created_at'];
    if (cat.id) {
        const res = await dbFetch(`/categories?id=eq.${cat.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        return res?.[0] ? snakeToCamel(res[0]) : null;
    }
    delete payload['id'];
    const res = await dbFetch('/categories', { method: 'POST', body: JSON.stringify(payload) });
    return res?.[0] ? snakeToCamel(res[0]) : null;
}
export async function deleteCategory(id: string) {
    return dbFetch(`/categories?id=eq.${id}`, { method: 'DELETE' });
}

// ══════════════════════════════════════
// PUBLIC API — Products
// ══════════════════════════════════════

export async function getProducts(branchId?: string): Promise<Product[]> {
    const filter = branchId ? `&branch_id=eq.${branchId}` : '';
    const data = await dbFetch(`/products?order=created_at.desc${filter}`);
    return (data || []).map((d: Record<string, unknown>) => snakeToCamel(d) as unknown as Product);
}
export async function saveProduct(p: Product & { branchId?: string }) {
    const payload = camelToSnake(p as unknown as Record<string, unknown>);
    delete payload['created_at'];
    if (p.id) {
        const res = await dbFetch(`/products?id=eq.${p.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        return res?.[0] ? snakeToCamel(res[0]) : null;
    }
    delete payload['id'];
    const res = await dbFetch('/products', { method: 'POST', body: JSON.stringify(payload) });
    return res?.[0] ? snakeToCamel(res[0]) : null;
}
export async function deleteProduct(id: string) {
    return dbFetch(`/products?id=eq.${id}`, { method: 'DELETE' });
}

// ══════════════════════════════════════
// PUBLIC API — Sales
// ══════════════════════════════════════

export async function getSales(branchId?: string): Promise<Sale[]> {
    const filter = branchId ? `&branch_id=eq.${branchId}` : '';
    const data = await dbFetch(`/sales?order=created_at.desc${filter}`);
    const raw = (data || []).map((d: Record<string, unknown>) => snakeToCamel(d) as unknown as Sale);
    // Deduplicate by ID
    const seen = new Set<string>();
    return raw.filter((s: Sale) => {
        if (seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
    });
}
export async function saveSale(s: Sale & { branchId?: string; userId?: string }) {
    const payload = camelToSnake(s as unknown as Record<string, unknown>);
    delete payload['created_at'];
    if (s.id) {
        const res = await dbFetch(`/sales?id=eq.${s.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        return res?.[0] ? snakeToCamel(res[0]) : null;
    }
    delete payload['id'];
    const res = await dbFetch('/sales', { method: 'POST', body: JSON.stringify(payload) });
    return res?.[0] ? snakeToCamel(res[0]) : null;
}
export async function deleteSale(id: string) {
    return dbFetch(`/sales?id=eq.${id}`, { method: 'DELETE' });
}

// ══════════════════════════════════════
// PUBLIC API — Repairs
// ══════════════════════════════════════

export async function getRepairs(branchId?: string): Promise<RepairRecord[]> {
    const filter = branchId ? `&branch_id=eq.${branchId}` : '';
    const data = await dbFetch(`/repairs?order=created_at.desc${filter}`);
    return (data || []).map((d: Record<string, unknown>) => snakeToCamel(d) as unknown as RepairRecord);
}
export async function saveRepair(r: (RepairRecord | Omit<RepairRecord, 'id'>) & { branchId?: string; userId?: string; id?: string }) {
    const payload = camelToSnake(r as unknown as Record<string, unknown>);
    delete payload['created_at'];
    if (r.id) {
        const res = await dbFetch(`/repairs?id=eq.${r.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        return res?.[0] ? snakeToCamel(res[0]) : null;
    }
    delete payload['id'];
    const res = await dbFetch('/repairs', { method: 'POST', body: JSON.stringify(payload) });
    return res?.[0] ? snakeToCamel(res[0]) : null;
}
export async function deleteRepair(id: string) {
    return dbFetch(`/repairs?id=eq.${id}`, { method: 'DELETE' });
}

// ══════════════════════════════════════
// PUBLIC API — Phone Sales
// ══════════════════════════════════════

export async function getPhoneSales(branchId?: string): Promise<PhoneSale[]> {
    const filter = branchId ? `&branch_id=eq.${branchId}` : '';
    try {
        const data = await dbFetch(`/phone_sales?order=created_at.desc${filter}`);
        return (data || []).map((d: Record<string, unknown>) => snakeToCamel(d) as unknown as PhoneSale);
    } catch {
        return [];
    }
}
export async function savePhoneSale(ps: PhoneSale & { branchId?: string; userId?: string }) {
    const payload = camelToSnake(ps as unknown as Record<string, unknown>);
    delete payload['created_at'];
    delete payload['id'];
    const res = await dbFetch('/phone_sales', { method: 'POST', body: JSON.stringify(payload) });
    return res?.[0] ? snakeToCamel(res[0]) : null;
}
export async function deletePhoneSale(id: string) {
    return dbFetch(`/phone_sales?id=eq.${id}`, { method: 'DELETE' });
}

// ══════════════════════════════════════
// PUBLIC API — Expenses
// ══════════════════════════════════════

export async function getExpenses(branchId?: string): Promise<Expense[]> {
    const filter = branchId ? `&branch_id=eq.${branchId}` : '';
    try {
        const data = await dbFetch(`/expenses?order=created_at.desc${filter}`);
        return (data || []).map((d: Record<string, unknown>) => snakeToCamel(d) as unknown as Expense);
    } catch {
        return [];
    }
}
export async function saveExpense(e: Expense & { branchId?: string }) {
    const payload = camelToSnake(e as unknown as Record<string, unknown>);
    delete payload['created_at'];
    if (e.id) {
        const res = await dbFetch(`/expenses?id=eq.${e.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        return res?.[0] ? snakeToCamel(res[0]) : null;
    }
    delete payload['id'];
    const res = await dbFetch('/expenses', { method: 'POST', body: JSON.stringify(payload) });
    return res?.[0] ? snakeToCamel(res[0]) : null;
}
export async function deleteExpense(id: string) {
    return dbFetch(`/expenses?id=eq.${id}`, { method: 'DELETE' });
}

// ══════════════════════════════════════
// PUBLIC API — Customer Requests
// ══════════════════════════════════════

export async function getCustomerRequests(branchId?: string): Promise<CustomerRequest[]> {
    const filter = branchId ? `&branch_id=eq.${branchId}` : '';
    try {
        const data = await dbFetch(`/customer_requests?order=created_at.desc${filter}`);
        return (data || []).map((d: Record<string, unknown>) => snakeToCamel(d) as unknown as CustomerRequest);
    } catch {
        return [];
    }
}
export async function saveCustomerRequest(cr: CustomerRequest & { branchId?: string }) {
    const payload = camelToSnake(cr as unknown as Record<string, unknown>);
    delete payload['created_at'];
    if (cr.id) {
        const res = await dbFetch(`/customer_requests?id=eq.${cr.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        return res?.[0] ? snakeToCamel(res[0]) : null;
    }
    delete payload['id'];
    const res = await dbFetch('/customer_requests', { method: 'POST', body: JSON.stringify(payload) });
    return res?.[0] ? snakeToCamel(res[0]) : null;
}
export async function deleteCustomerRequest(id: string) {
    return dbFetch(`/customer_requests?id=eq.${id}`, { method: 'DELETE' });
}

// ══════════════════════════════════════
// PUBLIC API — Phone Stocks
// ══════════════════════════════════════

export async function getPhoneStocks(branchId?: string): Promise<PhoneStock[]> {
    const filter = branchId ? `&branch_id=eq.${branchId}` : '';
    const data = await dbFetch(`/phone_stocks?select=*&order=created_at.desc${filter}`);
    return (data || []).map((d: Record<string, unknown>) => snakeToCamel(d) as unknown as PhoneStock);
}
export async function savePhoneStock(ps: Omit<PhoneStock, 'id' | 'createdAt'> & { id?: string; branchId?: string }) {
    const payload = camelToSnake(ps as unknown as Record<string, unknown>);
    delete payload['created_at'];
    if (ps.id) {
        const res = await dbFetch(`/phone_stocks?id=eq.${ps.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        return res?.[0] ? snakeToCamel(res[0]) : null;
    }
    delete payload['id'];
    const res = await dbFetch('/phone_stocks', { method: 'POST', body: JSON.stringify(payload) });
    return res?.[0] ? snakeToCamel(res[0]) : null;
}
export async function updatePhoneStockStatus(id: string, status: string) {
    return dbFetch(`/phone_stocks?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
}
export async function deletePhoneStock(id: string) {
    return dbFetch(`/phone_stocks?id=eq.${id}`, { method: 'DELETE' });
}

// ══════════════════════════════════════
// PUBLIC API — Suppliers
// ══════════════════════════════════════

export async function getSuppliers(branchId?: string): Promise<Supplier[]> {
    const filter = branchId ? `&branch_id=eq.${branchId}` : '';
    const data = await dbFetch(`/suppliers?select=*&order=created_at.desc${filter}`);
    return (data || []).map((d: Record<string, unknown>) => snakeToCamel(d) as unknown as Supplier);
}
export async function saveSupplier(s: Partial<Supplier> & { branchId?: string }) {
    const payload = camelToSnake(s as unknown as Record<string, unknown>);
    delete payload['created_at'];
    if (s.id) {
        const res = await dbFetch(`/suppliers?id=eq.${s.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        return res?.[0] ? snakeToCamel(res[0]) : null;
    }
    delete payload['id'];
    const res = await dbFetch('/suppliers', { method: 'POST', body: JSON.stringify(payload) });
    return res?.[0] ? snakeToCamel(res[0]) : null;
}
export async function updateSupplierBalance(supplierId: string, addAmount: number) {
    // Calculate new balance via RPC or direct PATCH
    const data = await dbFetch(`/suppliers?id=eq.${supplierId}&select=balance`);
    const currentBalance = data?.[0]?.balance || 0;
    return dbFetch(`/suppliers?id=eq.${supplierId}`, {
        method: 'PATCH',
        body: JSON.stringify({ balance: currentBalance + addAmount }),
    });
}

// ══════════════════════════════════════
// PUBLIC API — Purchases
// ══════════════════════════════════════

export async function getPurchases(branchId?: string): Promise<Purchase[]> {
    const filter = branchId ? `&branch_id=eq.${branchId}` : '';
    const data = await dbFetch(`/purchases?select=*,supplier:suppliers(*),items:purchase_items(*)&order=created_at.desc${filter}`);
    return (data || []).map((d: Record<string, unknown>) => {
        const mapped = snakeToCamel(d) as unknown as Purchase;
        if (d.supplier) mapped.supplier = snakeToCamel(d.supplier as Record<string, unknown>) as unknown as Supplier;
        if (d.items && Array.isArray(d.items)) {
            mapped.items = (d.items as Record<string, unknown>[]).map(i => snakeToCamel(i) as unknown as PurchaseItem);
        }
        return mapped;
    });
}
export async function savePurchase(p: Partial<Purchase> & { branchId?: string }) {
    const payload = camelToSnake(p as unknown as Record<string, unknown>);
    delete payload['created_at'];
    delete payload['supplier'];
    delete payload['items'];
    if (p.id) {
        const res = await dbFetch(`/purchases?id=eq.${p.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        return res?.[0] ? snakeToCamel(res[0]) : null;
    }
    delete payload['id'];
    const res = await dbFetch('/purchases', { method: 'POST', body: JSON.stringify(payload) });
    return res?.[0] ? snakeToCamel(res[0]) : null;
}
export async function savePurchaseItems(items: Omit<PurchaseItem, 'id'>[]) {
    const payload = items.map(i => {
        const mapped = camelToSnake(i as unknown as Record<string, unknown>);
        return mapped;
    });
    return dbFetch('/purchase_items', { method: 'POST', body: JSON.stringify(payload) });
}
export async function deletePurchase(id: string) {
    return dbFetch(`/purchases?id=eq.${id}`, { method: 'DELETE' });
}

// ══════════════════════════════════════
// PUBLIC API — Cari Hareketler
// ══════════════════════════════════════

export async function getCariHareketler(supplierId: string): Promise<CariHareket[]> {
    const data = await dbFetch(`/cari_hareketler?supplier_id=eq.${supplierId}&order=islem_tarihi.desc`);
    return (data || []).map((d: Record<string, unknown>) => snakeToCamel(d) as unknown as CariHareket);
}
export async function saveCariHareket(h: Partial<CariHareket>) {
    const payload = camelToSnake(h as unknown as Record<string, unknown>);
    delete payload['created_at'];
    delete payload['id'];
    const res = await dbFetch('/cari_hareketler', { method: 'POST', body: JSON.stringify(payload) });
    return res?.[0] ? snakeToCamel(res[0] as Record<string, unknown>) : null;
}

// ══════════════════════════════════════
// PUBLIC API — Payments
// ══════════════════════════════════════

export async function savePayment(p: Partial<Payment>) {
    const payload = camelToSnake(p as unknown as Record<string, unknown>);
    delete payload['created_at'];
    delete payload['id'];
    return dbFetch('/payments', { method: 'POST', body: JSON.stringify(payload) });
}

// ── Update product stock ──
export async function updateProductStockDB(productId: string, stock: number, purchasePrice?: number) {
    const body: Record<string, unknown> = { stock };
    if (purchasePrice !== undefined) body.purchase_price = purchasePrice;
    return dbFetch(`/products?id=eq.${productId}`, { method: 'PATCH', body: JSON.stringify(body) });
}

// ══════════════════════════════════════
// PUBLIC API — Customers
// ══════════════════════════════════════

export async function getCustomers(branchId?: string): Promise<Customer[]> {
    const filter = branchId ? `&branch_id=eq.${branchId}` : '';
    const data = await dbFetch(`/customers?select=*&order=created_at.desc${filter}`);
    return (data || []).map((d: Record<string, unknown>) => snakeToCamel(d) as unknown as Customer);
}
export async function saveCustomer(c: Partial<Customer> & { branchId?: string }) {
    const payload = camelToSnake(c as unknown as Record<string, unknown>);
    delete payload['created_at'];
    if (c.id) {
        const res = await dbFetch(`/customers?id=eq.${c.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        return res?.[0] ? snakeToCamel(res[0]) : null;
    }
    delete payload['id'];
    const res = await dbFetch('/customers', { method: 'POST', body: JSON.stringify(payload) });
    return res?.[0] ? snakeToCamel(res[0]) : null;
}
export async function deleteCustomer(id: string) {
    return dbFetch(`/customers?id=eq.${id}`, { method: 'DELETE' });
}

// ══════════════════════════════════════
// PUBLIC API — Reminders
// ══════════════════════════════════════

import type { Reminder } from '../pages/RemindersPage';

function reminderFromDb(row: Record<string, unknown>): Reminder {
    return {
        id: row.id as string,
        title: row.title as string,
        description: (row.description as string) || '',
        remindAt: row.remind_at as string,
        repeatType: (row.repeat_type as Reminder['repeatType']) || 'none',
        phoneNumber: (row.phone_number as string) || '',
        isSent: (row.is_sent as boolean) || false,
        isCompleted: (row.is_completed as boolean) || false,
        priority: (row.priority as Reminder['priority']) || 'medium',
        category: (row.category as string) || 'genel',
        createdAt: row.created_at as string,
    };
}

function reminderToDb(r: Partial<Reminder>): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    if (r.title !== undefined) obj.title = r.title;
    if (r.description !== undefined) obj.description = r.description;
    if (r.remindAt !== undefined) obj.remind_at = new Date(r.remindAt).toISOString();
    if (r.repeatType !== undefined) obj.repeat_type = r.repeatType;
    if (r.phoneNumber !== undefined) obj.phone_number = r.phoneNumber;
    if (r.isSent !== undefined) obj.is_sent = r.isSent;
    if (r.isCompleted !== undefined) obj.is_completed = r.isCompleted;
    if (r.priority !== undefined) obj.priority = r.priority;
    if (r.category !== undefined) obj.category = r.category;
    return obj;
}

export async function getReminders(branchId?: string): Promise<Reminder[]> {
    const filter = branchId ? `&branch_id=eq.${branchId}` : '';
    const data = await dbFetch(`/reminders?order=remind_at.asc${filter}`);
    return (data || []).map(reminderFromDb);
}

export async function createReminder(r: Partial<Reminder> & { branchId?: string }): Promise<Reminder> {
    const payload = reminderToDb(r);
    if (r.branchId) payload.branch_id = r.branchId;
    const data = await dbFetch('/reminders', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return reminderFromDb(Array.isArray(data) ? data[0] : data);
}

export async function updateReminder(id: string, r: Partial<Reminder>): Promise<Reminder> {
    const data = await dbFetch(`/reminders?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify(reminderToDb(r)),
    });
    return reminderFromDb(Array.isArray(data) ? data[0] : data);
}

export async function deleteReminder(id: string): Promise<void> {
    await dbFetch(`/reminders?id=eq.${id}`, { method: 'DELETE' });
}

export async function markReminderSent(id: string): Promise<void> {
    await dbFetch(`/reminders?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_sent: true }),
    });
}

// ══════════════════════════════════════
// MEGA FEATURES — Warranty, Technicians, Parts, Photos, Appointments
// ══════════════════════════════════════

// ── Warranty Records ──
export async function getWarrantyRecords(branchId?: string): Promise<WarrantyRecord[]> {
    const filter = branchId ? `&branch_id=eq.${branchId}` : '';
    const data = await dbFetch(`/warranty_records?order=warranty_end_date.asc${filter}`);
    return (data || []).map((d: Record<string, unknown>) => {
        const mapped = snakeToCamel(d) as unknown as WarrantyRecord;
        const daysRemaining = Math.ceil((new Date(mapped.warrantyEndDate).getTime() - Date.now()) / 86400000);
        return { ...mapped, daysRemaining };
    });
}

export async function saveWarrantyRecord(w: Partial<WarrantyRecord> & { branchId?: string }) {
    const payload = camelToSnake(w as Record<string, unknown>);
    delete payload['created_at'];
    delete payload['days_remaining'];
    if (w.id) {
        const res = await dbFetch(`/warranty_records?id=eq.${w.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        return res?.[0] ? snakeToCamel(res[0] as Record<string, unknown>) : null;
    }
    delete payload['id'];
    const res = await dbFetch('/warranty_records', { method: 'POST', body: JSON.stringify(payload) });
    return res?.[0] ? snakeToCamel(res[0] as Record<string, unknown>) : null;
}

// ── Technicians ──
export async function getTechnicians(): Promise<Technician[]> {
    const data = await dbFetch('/technicians?is_active=eq.true&order=name.asc');
    return (data || []).map((d: Record<string, unknown>) => snakeToCamel(d) as unknown as Technician);
}

export async function saveTechnician(t: Partial<Technician>) {
    const payload = camelToSnake(t as Record<string, unknown>);
    delete payload['created_at'];
    if (t.id) {
        const res = await dbFetch(`/technicians?id=eq.${t.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        return res?.[0] ? snakeToCamel(res[0] as Record<string, unknown>) : null;
    }
    delete payload['id'];
    const res = await dbFetch('/technicians', { method: 'POST', body: JSON.stringify(payload) });
    return res?.[0] ? snakeToCamel(res[0] as Record<string, unknown>) : null;
}

// ── Repair Parts ──
export async function getRepairParts(branchId?: string) {
    const filter = branchId ? `&branch_id=eq.${branchId}` : '';
    const data = await dbFetch(`/repair_parts?is_active=eq.true&order=part_name.asc${filter}`);
    return (data || []).map((d: Record<string, unknown>) => snakeToCamel(d));
}

export async function saveRepairPart(p: Record<string, unknown>) {
    const payload = camelToSnake(p);
    delete payload['created_at'];
    if (p.id) {
        const res = await dbFetch(`/repair_parts?id=eq.${p.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        return res?.[0] ? snakeToCamel(res[0] as Record<string, unknown>) : null;
    }
    delete payload['id'];
    const res = await dbFetch('/repair_parts', { method: 'POST', body: JSON.stringify(payload) });
    return res?.[0] ? snakeToCamel(res[0] as Record<string, unknown>) : null;
}

export async function getRepairPartUsage(repairId: string) {
    const data = await dbFetch(`/repair_part_usage?repair_id=eq.${repairId}&select=*,part:repair_parts(*)`);
    return (data || []).map((d: Record<string, unknown>) => ({
        ...snakeToCamel(d),
        part: d.part ? snakeToCamel(d.part as Record<string, unknown>) : null,
    }));
}

export async function addPartToRepair(usage: Record<string, unknown>) {
    const res = await dbFetch('/repair_part_usage', { method: 'POST', body: JSON.stringify(camelToSnake(usage)) });
    return res?.[0] ? snakeToCamel(res[0] as Record<string, unknown>) : null;
}

// ── Repair Photos ──
export async function getRepairPhotos(repairId: string) {
    const data = await dbFetch(`/repair_photos?repair_id=eq.${repairId}&order=created_at.asc`);
    return (data || []).map((d: Record<string, unknown>) => ({
        id: d.id as string,
        url: d.url as string,
        uploadedAt: d.created_at as string,
        type: d.photo_type as 'before' | 'after',
        note: (d.note as string) || '',
    }));
}

export async function saveRepairPhoto(repairId: string, photo: { id: string; url: string; type: string; note?: string }) {
    return dbFetch('/repair_photos', {
        method: 'POST',
        body: JSON.stringify({
            id: photo.id,
            repair_id: repairId,
            url: photo.url,
            photo_type: photo.type,
            note: photo.note || '',
        }),
    });
}

export async function deleteRepairPhoto(photoId: string) {
    return dbFetch(`/repair_photos?id=eq.${photoId}`, { method: 'DELETE' });
}

// ── Appointments ──
export async function getAppointments(startDate: string, endDate: string, branchId?: string): Promise<RepairAppointment[]> {
    const filter = branchId ? `&branch_id=eq.${branchId}` : '';
    const data = await dbFetch(
        `/repair_appointments?appointment_date=gte.${startDate}&appointment_date=lte.${endDate}&order=appointment_date.asc,appointment_time.asc${filter}`
    );
    return (data || []).map((d: Record<string, unknown>) => snakeToCamel(d) as unknown as RepairAppointment);
}

export async function saveAppointment(apt: Record<string, unknown>) {
    const payload = camelToSnake(apt);
    delete payload['created_at'];
    if (apt.id) {
        const res = await dbFetch(`/repair_appointments?id=eq.${apt.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        return res?.[0] ? snakeToCamel(res[0] as Record<string, unknown>) : null;
    }
    delete payload['id'];
    const res = await dbFetch('/repair_appointments', { method: 'POST', body: JSON.stringify(payload) });
    return res?.[0] ? snakeToCamel(res[0] as Record<string, unknown>) : null;
}

export async function deleteAppointment(id: string) {
    await dbFetch(`/repair_appointments?id=eq.${id}`, { method: 'DELETE' });
}

// ══════════════════════════════════════
// Backup
// ══════════════════════════════════════

export async function saveBackupToSupabase(backupData: Record<string, unknown[]>, fileName: string) {
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const file = new File([blob], fileName, { type: 'application/json' });

    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/backups/${fileName}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
            'x-upsert': 'true',
        },
        body: file,
    });
    if (!res.ok) throw new Error('Yedek Storage\'a yüklenemedi');
    return { success: true };
}

export async function getBackupsList() {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/backups`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prefix: '', limit: 100, sortBy: { column: 'created_at', order: 'desc' } }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.filter((f: any) => f.name !== '.emptyFolderPlaceholder');
}

export async function deleteBackupFromSupabase(fileName: string) {
    await fetch(`${SUPABASE_URL}/storage/v1/object/backups`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prefixes: [fileName] }),
    });
}

export async function downloadBackupFromSupabase(fileName: string) {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/authenticated/backups/${fileName}`, {
        headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'apikey': SUPABASE_ANON_KEY,
        }
    });
    if (!res.ok) throw new Error('Yedek indirilemedi');
    const blob = await res.blob();
    return new File([blob], fileName, { type: 'application/json' });
}

export async function triggerManualBackup(uploadToCloud: boolean = true) {
    const tables = ['products', 'categories', 'sales', 'repairs', 'phone_stocks',
        'phone_sales', 'expenses', 'customer_requests', 'suppliers', 'purchases',
        'customers', 'reminders'];
    const backup: Record<string, unknown[]> = {};
    const rowCounts: Record<string, number> = {};
    for (const table of tables) {
        try {
            const data = await dbFetch(`/${table}?order=created_at.desc&limit=10000`);
            backup[table] = data || [];
            rowCounts[table] = (data || []).length;
        } catch { backup[table] = []; rowCounts[table] = 0; }
    }

    const fileName = `stoktakip_backup_${new Date().toISOString().split('T')[0]}_${Math.random().toString(36).slice(2, 6)}.json`;

    if (uploadToCloud) {
        await saveBackupToSupabase(backup, fileName);
    } else {
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    }

    return { success: true, rowCounts, fileName };
}

export async function restoreFromBackup(file: File) {
    const text = await file.text();
    const backup = JSON.parse(text);
    for (const [table, rows] of Object.entries(backup)) {
        if (!Array.isArray(rows)) continue;
        for (const row of rows) {
            try {
                await dbFetch(`/${table}`, {
                    method: 'POST',
                    headers: { 'Prefer': 'resolution=merge-duplicates' },
                    body: JSON.stringify(row),
                });
            } catch { /* skip duplicate */ }
        }
    }
    return { success: true };
}

// ══════════════════════════════════════
// AI Forecast
// ══════════════════════════════════════

export async function getAIForecast(branchId?: string) {
    let salesRaw: any[] = [];
    try {
        const filter = branchId ? `&branch_id=eq.${branchId}` : '';
        const data = await dbFetch(`/sales?order=created_at.desc&limit=50${filter}`);
        salesRaw = data || [];
    } catch {
        salesRaw = [];
    }

    try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        const salesData = salesRaw.slice(0, 50).map((s: any) => ({
            date: s.date || s.created_at,
            totalPrice: s.total_price ?? 0,
            productName: s.items?.[0]?.productName || s.items?.[0]?.product_name || 'Ürün',
            quantity: s.items?.reduce((sum: number, i: any) => sum + (i.quantity || 0), 0) || 1,
        }));

        const safeSalesData = salesData.length > 0
            ? salesData
            : [{ date: new Date().toISOString(), totalPrice: 0, productName: "Veri Yok", quantity: 0 }];

        const prompt = `Aşağıdaki son satış verilerini analiz et ve bir JSON formatında satış tahmini döndür.
Veriler: ${JSON.stringify(safeSalesData)}

JSON formatı tam olarak şu şekilde olmalıdır ve SADECE JSON döndür:
{
  "nextWeekForecast": Yedi günlük tahmini satış tutarı (number),
  "nextMonthForecast": Otuz günlük tahmini satış tutarı (number),
  "trend": "artış", "düşüş" veya "stabil",
  "trendPercent": Yüzdelik değişim beklentisi (number),
  "recommendations": ["öneri 1", "öneri 2", "öneri 3"],
  "riskFactors": ["risk 1", "risk 2"]
}`;

        if (apiKey) {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                })
            });

            if (response.ok) {
                const result = await response.json();
                const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    return {
                        success: true,
                        forecast: JSON.parse(text),
                        dataPoints: salesRaw.length,
                    };
                }
            }
        }

        throw new Error("Gemini API yanıt vermedi");

    } catch (error) {
        console.error("AI Forecast Error:", error);
        const totalRevenue = salesRaw.reduce((s: number, sale: any) => s + (Number(sale.total_price) || 0), 0);
        const avgDaily = totalRevenue / Math.max(salesRaw.length, 1);
        return {
            success: true,
            forecast: {
                nextWeekForecast: Math.round(avgDaily * 7),
                nextMonthForecast: Math.round(avgDaily * 30),
                trend: totalRevenue > 0 ? 'stabil' : 'stabil',
                trendPercent: 0,
                recommendations: [
                    'AI tahmin servisine ulaşılamadı. Yerel veriler kullanıldı.',
                    'En çok satan ürünlerin stok seviyelerini kontrol edin',
                    'Düşük stoklu ürünleri yeniden sipariş edin',
                ],
                riskFactors: ['Mevsimsel dalgalanmalara dikkat edin'],
            },
            dataPoints: salesRaw.length,
        };
    }
}
