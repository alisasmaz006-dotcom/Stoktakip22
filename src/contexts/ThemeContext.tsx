import { createContext, useContext, useEffect, useState } from 'react';

export interface ColorTheme {
    id: string;
    name: string;
    emoji: string;
    description: string;
    primary: string;
    primaryHover: string;
    bgDark: string;
    surfaceDark: string;
    surfaceHover: string;
    previewColors: string[]; // 3 renk, önizleme için
}

export const COLOR_THEMES: ColorTheme[] = [
    {
        id: 'midnight-blue',
        name: 'Gece Mavisi',
        emoji: '🌌',
        description: 'Varsayılan koyu mavi tema',
        primary: '#4144f1',
        primaryHover: '#3538cf',
        bgDark: '#0f172a',
        surfaceDark: '#1e293b',
        surfaceHover: '#334155',
        previewColors: ['#4144f1', '#1e293b', '#0f172a'],
    },
    {
        id: 'ocean-cyan',
        name: 'Okyanus',
        emoji: '🌊',
        description: 'Ferah açık mavi & turkuaz',
        primary: '#06b6d4',
        primaryHover: '#0891b2',
        bgDark: '#071e26',
        surfaceDark: '#0c2d3a',
        surfaceHover: '#164252',
        previewColors: ['#06b6d4', '#0c2d3a', '#071e26'],
    },
    {
        id: 'emerald-forest',
        name: 'Zümrüt Orman',
        emoji: '🌿',
        description: 'Doğal yeşil tonları',
        primary: '#10b981',
        primaryHover: '#059669',
        bgDark: '#061a13',
        surfaceDark: '#0d2b1e',
        surfaceHover: '#164030',
        previewColors: ['#10b981', '#0d2b1e', '#061a13'],
    },
    {
        id: 'violet-galaxy',
        name: 'Mor Galaksi',
        emoji: '🔮',
        description: 'Gizemli mor & lavanta',
        primary: '#8b5cf6',
        primaryHover: '#7c3aed',
        bgDark: '#0f0a1e',
        surfaceDark: '#1a1030',
        surfaceHover: '#2d1f4e',
        previewColors: ['#8b5cf6', '#1a1030', '#0f0a1e'],
    },
    {
        id: 'golden-amber',
        name: 'Altın Kehribar',
        emoji: '✨',
        description: 'Sıcak altın sarısı tonları',
        primary: '#f59e0b',
        primaryHover: '#d97706',
        bgDark: '#1a1100',
        surfaceDark: '#2a1c00',
        surfaceHover: '#3d2900',
        previewColors: ['#f59e0b', '#2a1c00', '#1a1100'],
    },
    {
        id: 'crimson-fire',
        name: 'Kızıl Ateş',
        emoji: '🔥',
        description: 'Enerjik kırmızı & turuncu',
        primary: '#ef4444',
        primaryHover: '#dc2626',
        bgDark: '#1a0808',
        surfaceDark: '#2a1010',
        surfaceHover: '#3d1a1a',
        previewColors: ['#ef4444', '#2a1010', '#1a0808'],
    },
    {
        id: 'rose-neon',
        name: 'Neon Pembe',
        emoji: '🌸',
        description: 'Canlı pembe & fuşya',
        primary: '#ec4899',
        primaryHover: '#db2777',
        bgDark: '#170b14',
        surfaceDark: '#271020',
        surfaceHover: '#3d1830',
        previewColors: ['#ec4899', '#271020', '#170b14'],
    },
    {
        id: 'teal-mint',
        name: 'Nane Yeşili',
        emoji: '🍃',
        description: 'Taze teal & mint tonları',
        primary: '#14b8a6',
        primaryHover: '#0d9488',
        bgDark: '#071918',
        surfaceDark: '#0d2926',
        surfaceHover: '#153d3a',
        previewColors: ['#14b8a6', '#0d2926', '#071918'],
    },
    {
        id: 'orange-energy',
        name: 'Turuncu Enerji',
        emoji: '⚡',
        description: 'Dinamik turuncu & amber',
        primary: '#f97316',
        primaryHover: '#ea6c09',
        bgDark: '#180d02',
        surfaceDark: '#271605',
        surfaceHover: '#3b2208',
        previewColors: ['#f97316', '#271605', '#180d02'],
    },
    {
        id: 'steel-gray',
        name: 'Çelik Gri',
        emoji: '🔩',
        description: 'Profesyonel gri & gümüş',
        primary: '#64748b',
        primaryHover: '#475569',
        bgDark: '#0a0d12',
        surfaceDark: '#111827',
        surfaceHover: '#1f2937',
        previewColors: ['#64748b', '#111827', '#0a0d12'],
    },
];

interface ThemeContextType {
    currentTheme: ColorTheme;
    setTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    currentTheme: COLOR_THEMES[0],
    setTheme: () => { },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [currentTheme, setCurrentTheme] = useState<ColorTheme>(() => {
        const savedId = localStorage.getItem('app-color-theme');
        return COLOR_THEMES.find(t => t.id === savedId) ?? COLOR_THEMES[0];
    });

    const applyTheme = (theme: ColorTheme) => {
        const root = document.documentElement;
        root.style.setProperty('--color-primary', theme.primary);
        root.style.setProperty('--color-primary-hover', theme.primaryHover);
        root.style.setProperty('--color-bg-dark', theme.bgDark);
        root.style.setProperty('--color-surface-dark', theme.surfaceDark);
        root.style.setProperty('--color-surface-hover', theme.surfaceHover);
        // body arka plan da güncelle
        document.body.style.backgroundColor = theme.bgDark;
    };

    useEffect(() => {
        applyTheme(currentTheme);
    }, [currentTheme]);

    const setTheme = (themeId: string) => {
        const theme = COLOR_THEMES.find(t => t.id === themeId);
        if (!theme) return;
        localStorage.setItem('app-color-theme', themeId);
        setCurrentTheme(theme);
        applyTheme(theme);
    };

    return (
        <ThemeContext.Provider value={{ currentTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
