import { useAuth } from '../contexts/AuthContext';
import { useBranch } from '../contexts/BranchContext';

interface SidebarProps {
    activeView: string;
    onViewChange: (view: string) => void;
    isOpen?: boolean;
    onClose?: () => void;
    // Mobile Settings Props
    priceVisible: boolean;
    togglePrice: () => void;
    currency: 'TRY' | 'USD';
    setCurrency: (c: 'TRY' | 'USD') => void;
}

const menuItems = [
    // Herkes görebilir
    { id: 'sales',        label: 'Satış & Raporlar',   icon: 'dashboard',            ownerOnly: false },
    { id: 'products',     label: 'Ürünler',             icon: 'inventory_2',          ownerOnly: false },
    { id: 'repairs',      label: 'Tamir Kayıtları',     icon: 'build',                ownerOnly: false },
    { id: 'repairParts',  label: 'Parça Stoğu',         icon: 'construction',         ownerOnly: false },
    { id: 'phoneSales',   label: 'Telefon Satışları',   icon: 'smartphone',           ownerOnly: false },
    { id: 'customers',    label: 'Müşteriler',          icon: 'group',                ownerOnly: false },
    { id: 'requests',     label: 'İstek & Siparişler',  icon: 'list_alt',             ownerOnly: false },
    { id: 'calculator',   label: 'Hesap Makinası',      icon: 'calculate',            ownerOnly: false },
    { id: 'reminders',    label: 'Hatırlatıcılar',      icon: 'notifications_active', ownerOnly: false },
    { id: 'appointments', label: 'Randevu Takvimi',     icon: 'calendar_month',       ownerOnly: false },
    // Sadece owner görebilir
    { id: 'analytics',    label: 'Analizler',           icon: 'bar_chart',            ownerOnly: true  },
    { id: 'purchases',    label: 'Alışlar',             icon: 'shopping_bag',         ownerOnly: true  },
    { id: 'expenses',     label: 'Giderler',            icon: 'trending_down',        ownerOnly: true  },
    { id: 'suppliers',    label: 'Tedarikçiler',        icon: 'store',                ownerOnly: true  },
    { id: 'warranty',     label: 'Garanti Takibi',      icon: 'verified_user',        ownerOnly: true  },
    { id: 'aiForecast',   label: 'AI Tahmin',           icon: 'auto_awesome',         ownerOnly: true  },
    { id: 'backup',       label: 'Veri Yedekleme',      icon: 'cloud_sync',           ownerOnly: true  },
    { id: 'settings',     label: 'Genel Ayarlar',       icon: 'settings',             ownerOnly: true  },
];

export default function Sidebar({
    activeView, onViewChange, isOpen, onClose,
    priceVisible, togglePrice, currency, setCurrency
}: SidebarProps) {
    const { currentUser, isOwner, logout } = useAuth();
    const { branches, activeBranch, setActiveBranch, viewMode, setViewMode } = useBranch();

    // Role göre filtrele
    const visibleItems = menuItems.filter(item => isOwner || !item.ownerOnly);

    return (
        <>
            {/* Mobile Menu Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                    onClick={onClose}
                />
            )}

            <aside className={`fixed md:relative z-50 w-64 flex-shrink-0 border-r border-slate-800 bg-surface-dark flex flex-col justify-between h-screen transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo */}
                <div className="p-6 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/20 p-2 rounded-lg">
                            <span className="material-symbols-outlined text-primary text-3xl">inventory_2</span>
                        </div>
                        <div>
                            <h1 className="text-white text-lg font-bold leading-tight">StokTakip Pro</h1>
                            <p className="text-slate-400 text-xs">
                                {isOwner ? 'Yönetici Paneli' : 'Çalışan Paneli'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Owner: Şube Seçici */}
                {isOwner && (
                    <div className="px-3 mb-4">
                        <div className="bg-slate-800/60 rounded-xl p-2 border border-slate-700">
                            <p className="text-xs text-slate-500 mb-2 px-1">Görüntülenen Şube</p>
                            <button
                                onClick={() => setViewMode('all')}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all mb-1 ${
                                    viewMode === 'all' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-slate-400 hover:bg-slate-700'
                                }`}
                            >
                                <span className="material-symbols-outlined text-sm align-middle mr-1">store</span>
                                Tüm Şubeler
                            </button>
                            {branches.map(branch => (
                                <button
                                    key={branch.id}
                                    onClick={() => { setActiveBranch(branch); setViewMode('single'); }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all mb-1 ${
                                        viewMode === 'single' && activeBranch?.id === branch.id
                                            ? 'bg-primary/20 text-primary border border-primary/30'
                                            : 'text-slate-400 hover:bg-slate-700'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-sm align-middle mr-1">location_on</span>
                                    {branch.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Worker: Şube göstergesi */}
                {!isOwner && activeBranch && (
                    <div className="px-3 mb-4">
                        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                                <span className="text-sm text-white font-medium">{activeBranch.name}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-thin">
                    <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-1">Menü</p>
                    {visibleItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={`menu-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left relative ${activeView === item.id
                                ? 'bg-primary/10 text-primary'
                                : 'text-slate-300 hover:bg-surface-hover group'
                                }`}
                        >
                            {activeView === item.id && (
                                <div className="menu-indicator absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary rounded-r-full"></div>
                            )}
                            <span className={`material-symbols-outlined transition-transform duration-200 ${activeView === item.id ? 'text-primary scale-110' : 'text-slate-400 group-hover:text-primary group-hover:scale-110'}`}>
                                {item.icon}
                            </span>
                            <span className={`text-sm ${activeView === item.id ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* User section & Settings */}
                <div className="p-4 border-t border-slate-800 space-y-4">
                    {/* Settings for Mobile */}
                    <div className="md:hidden space-y-3 px-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hızlı Ayarlar</p>

                        <div className="flex items-center justify-between p-2 rounded-xl bg-surface-hover/50 border border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-slate-400">{priceVisible ? 'visibility' : 'visibility_off'}</span>
                                <span className="text-xs text-slate-300">Fiyat Görünürlüğü</span>
                            </div>
                            <button
                                onClick={togglePrice}
                                className={`w-8 h-4 rounded-full relative transition-colors ${priceVisible ? 'bg-primary' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${priceVisible ? 'left-4' : 'left-1'}`}></div>
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-xl bg-surface-hover/50 border border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-slate-400">payments</span>
                                <span className="text-xs text-slate-300">Para Birimi</span>
                            </div>
                            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                                <button
                                    onClick={() => setCurrency('TRY')}
                                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${currency === 'TRY' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400'}`}
                                >TL</button>
                                <button
                                    onClick={() => setCurrency('USD')}
                                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${currency === 'USD' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400'}`}
                                >USD</button>
                            </div>
                        </div>
                    </div>

                    {/* Kullanıcı Bilgisi */}
                    <div className="px-3 py-2">
                        <div className="flex items-center gap-2 px-2 py-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-sm">person</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{currentUser?.name}</p>
                                <p className="text-xs text-slate-500">
                                    {isOwner ? 'Mağaza Sahibi' : 'Çalışan'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={logout}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover cursor-pointer transition-colors"
                    >
                        <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-red-400">logout</span>
                        </div>
                        <span className="text-sm font-semibold text-red-400">Çıkış Yap</span>
                    </div>
                </div>
            </aside>
        </>
    );
}
