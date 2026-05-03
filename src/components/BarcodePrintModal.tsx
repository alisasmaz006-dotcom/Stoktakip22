import { useState } from 'react';
import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';
import type { Product } from '../types';

interface Props {
    products: Product[];
    onClose: () => void;
}

export default function BarcodePrintModal({ products, onClose }: Props) {
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [settings, setSettings] = useState({
        labelWidth: 50,
        labelHeight: 30,
        labelsPerRow: 3,
        showPrice: true,
        showProductName: true,
    });

    const generateBarcodePNG = (barcode: string): string => {
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, barcode, { format: 'CODE128', width: 2, height: 40, displayValue: true, fontSize: 10 });
        return canvas.toDataURL('image/png');
    };

    const generatePDF = () => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageHeight = 297;
        const margin = 5;
        const gap = 2;
        const { labelWidth, labelHeight, labelsPerRow } = settings;
        let x = margin, y = margin, col = 0;

        for (const [productId, qty] of Object.entries(quantities)) {
            if (qty <= 0) continue;
            const product = products.find(p => p.id === productId);
            if (!product) continue;
            for (let i = 0; i < qty; i++) {
                doc.rect(x, y, labelWidth, labelHeight);
                if (settings.showProductName) {
                    doc.setFontSize(7);
                    doc.setFont('helvetica', 'normal');
                    doc.text(product.name.substring(0, 22), x + 2, y + 5, { maxWidth: labelWidth - 4 });
                }
                if (product.barcode) {
                    try {
                        const barcodeImg = generateBarcodePNG(product.barcode);
                        doc.addImage(barcodeImg, 'PNG', x + 2, y + 7, labelWidth - 4, 14);
                    } catch {
                        doc.setFontSize(8);
                        doc.text(product.barcode, x + labelWidth / 2, y + 16, { align: 'center' });
                    }
                }
                if (settings.showPrice) {
                    doc.setFontSize(9);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`₺${product.salePrice.toFixed(2)}`, x + labelWidth / 2, y + labelHeight - 3, { align: 'center' });
                }
                col++;
                if (col >= labelsPerRow) { col = 0; x = margin; y += labelHeight + gap; } else { x += labelWidth + gap; }
                if (y + labelHeight > pageHeight - margin) { doc.addPage(); x = margin; y = margin; col = 0; }
            }
        }
        doc.save(`barkod_etiketleri_${Date.now()}.pdf`);
    };

    const totalLabels = Object.values(quantities).reduce((a, b) => a + b, 0);

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white">Barkod Etiket Yazdırma</h2>
                    <p className="text-slate-400 text-sm mt-1">Ürün seçin ve adet belirleyin</p>
                </div>
                <div className="p-4 border-b border-slate-700 flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
                        <input type="checkbox" checked={settings.showProductName}
                            onChange={e => setSettings(s => ({ ...s, showProductName: e.target.checked }))} className="rounded" />
                        Ürün Adı
                    </label>
                    <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
                        <input type="checkbox" checked={settings.showPrice}
                            onChange={e => setSettings(s => ({ ...s, showPrice: e.target.checked }))} className="rounded" />
                        Fiyat
                    </label>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                        <span>Sütun:</span>
                        <select value={settings.labelsPerRow}
                            onChange={e => setSettings(s => ({ ...s, labelsPerRow: parseInt(e.target.value) }))}
                            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm">
                            {[2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                </div>
                <div className="overflow-y-auto flex-1 p-4 space-y-2">
                    {products.map(product => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{product.name}</p>
                                <p className="text-slate-400 text-xs">{product.barcode} · ₺{product.salePrice}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                                <button onClick={() => setQuantities(prev => ({ ...prev, [product.id]: Math.max(0, (prev[product.id] || 0) - 1) }))}
                                    className="w-8 h-8 bg-slate-700 rounded-lg text-white hover:bg-slate-600 font-bold">−</button>
                                <span className="w-8 text-center text-white font-medium">{quantities[product.id] || 0}</span>
                                <button onClick={() => setQuantities(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }))}
                                    className="w-8 h-8 bg-primary rounded-lg text-white hover:bg-primary/80 font-bold">+</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-slate-700 flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700">İptal</button>
                    <button onClick={generatePDF} disabled={totalLabels === 0}
                        className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed font-medium">
                        PDF Oluştur ({totalLabels} etiket)
                    </button>
                </div>
            </div>
        </div>
    );
}
